const pool = require("../config/database");


const getPipeline = async (orgId) => {
  const connection = await pool.getConnection();

  try {
    // Get ALL 5 fixed pipeline stages for the CRM org
    // (stages belong to req.user.org_id, not the client's org)
    const [stages] = await connection.execute(`
      SELECT
        stage_id,
        org_id,
        name,
        sort_order
      FROM pipeline_stages
      WHERE org_id = ?
      ORDER BY sort_order ASC
    `, [orgId]);

    // Get all deals for this CRM org via created_by_user_id -> users -> org_id
    const [deals] = await connection.execute(`
      SELECT
        d.deal_id,
        d.org_id,
        d.stage_id,
        d.contact_id,
        d.deal_name,
        d.company_name,
        d.value,
        d.contact_executive_id,
        d.dev_progress,
        d.lost_reason,
        d.created_at,
        d.updated_at,

        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.job_title,

        o.name AS organization_name,
        o.website,
        o.industry,
        o.territory,
        o.source

      FROM deals d

      LEFT JOIN contacts c ON d.contact_id = c.contact_id
      LEFT JOIN organizations o ON d.org_id = o.org_id
      INNER JOIN users u ON d.created_by_user_id = u.id

      WHERE u.org_id = ?
      ORDER BY d.created_at DESC
    `, [orgId]);

    // Map stages — every stage is shown even if it has 0 deals
    const pipeline = stages.map(stage => ({
      stage_id: stage.stage_id,
      org_id: stage.org_id,
      name: stage.name,
      sort_order: stage.sort_order,
      deals: deals.filter(deal => deal.stage_id === stage.stage_id)
    }));

    return pipeline;

  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};



const getDealById = async (dealId, orgId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      d.*,

      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.job_title,

      o.name AS organization_name,
      o.website,
      o.industry,
      o.territory,
      o.source,

      ps.name AS stage_name

    FROM deals d

    LEFT JOIN contacts c ON d.contact_id = c.contact_id
    LEFT JOIN organizations o ON d.org_id = o.org_id
    LEFT JOIN pipeline_stages ps ON d.stage_id = ps.stage_id
    INNER JOIN users u ON d.created_by_user_id = u.id

    WHERE d.deal_id = ? AND u.org_id = ?
    `,
    [dealId, orgId]
  );

  return rows.length ? rows[0] : null;
};



const createDeal = async (dealData) => {
  const {
    org_id,
    stage_id,
    contact_id,
    deal_name,
    company_name,
    value,
    contact_executive_id,
    dev_progress,
    lost_reason
  } = dealData;

  const [result] = await pool.execute(
    `
    INSERT INTO deals
    (
      org_id,
      stage_id,
      contact_id,
      deal_name,
      company_name,
      value,
      contact_executive_id,
      dev_progress,
      lost_reason
    )
    VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      org_id,
      stage_id,
      contact_id,
      deal_name,
      company_name,
      value,
      contact_executive_id,
      dev_progress,
      lost_reason
    ]
  );

  return {
    success: true,
    deal_id: result.insertId
  };
};


const updateDeal = async (dealId, orgId, dealData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      deal_name,
      company_name,
      value,
      contact_executive_id,
      dev_progress,
      lost_reason,
      contact_id,
      contact_person_name
    } = dealData;
    // NOTE: stage_id is NOT updated here — use moveDeal for stage changes

    // Verify this deal belongs to the CRM org (via the user who created it)
    const [[existingDeal]] = await connection.execute(
      `SELECT d.deal_id, d.contact_id
       FROM deals d
       INNER JOIN users u ON d.created_by_user_id = u.id
       WHERE d.deal_id = ? AND u.org_id = ?`,
      [dealId, orgId]
    );

    if (!existingDeal) throw new Error("Deal not found or unauthorized");

    // Update deal core fields (NOT stage_id — that's managed by moveDeal)
    const [result] = await connection.execute(
      `
      UPDATE deals
      SET
        deal_name = ?,
        company_name = ?,
        value = ?,
        contact_executive_id = ?,
        dev_progress = ?
      WHERE deal_id = ?
      `,
      [
        deal_name,
        company_name,
        value ?? 0,
        contact_executive_id ?? null,
        dev_progress ?? 0,
        dealId
      ]
    );

    // Update contact name if provided
    if (contact_id && contact_person_name && contact_person_name.trim()) {
      const parts = contact_person_name.trim().split(/\s+/);
      const first_name = parts[0] || "";
      const last_name = parts.slice(1).join(" ") || "";
      await connection.execute(
        `UPDATE contacts SET first_name = ?, last_name = ? WHERE contact_id = ?`,
        [first_name, last_name, contact_id]
      );
    }

    await connection.commit();
    return { success: true, affectedRows: result.affectedRows };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


// moveDeal — handles Won/Lost logic, logs activity, optionally adds note
const moveDeal = async (dealId, orgId, userId, stageId, lostReason = null, noteText = null) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get the deal + target stage details
    const [[deal]] = await connection.execute(
      `SELECT d.deal_id, d.contact_id, d.org_id, d.company_name, d.deal_name
       FROM deals d
       INNER JOIN users u ON d.created_by_user_id = u.id
       WHERE d.deal_id = ? AND u.org_id = ?`,
      [dealId, orgId]
    );

    if (!deal) throw new Error("Deal not found or unauthorized");

    const [[stage]] = await connection.execute(
      `SELECT stage_id, name FROM pipeline_stages WHERE stage_id = ?`,
      [stageId]
    );

    if (!stage) throw new Error("Stage not found");

    const stageName = stage.name;

    // 2. Update deal stage (and lost_reason if applicable)
    if (stageName === 'Lost') {
      await connection.execute(
        `UPDATE deals SET stage_id = ?, lost_reason = ? WHERE deal_id = ?`,
        [stageId, lostReason || 'Not specified', dealId]
      );
    } else {
      await connection.execute(
        `UPDATE deals SET stage_id = ?, lost_reason = NULL WHERE deal_id = ?`,
        [stageId, dealId]
      );
    }

    // 3. Won-specific logic
    if (stageName === 'Won') {
      // a. Update contact status to 'Won Contact'
      await connection.execute(
        `UPDATE contacts SET contact_status = 'Won Contact' WHERE contact_id = ?`,
        [deal.contact_id]
      );

      // b. Upsert client_companies record so the company can be onboarded
      //    org_id = CRM user's org (owner), linked_org_id = client's org
      await connection.execute(
        `
        INSERT INTO client_companies (org_id, name, website, industry, linked_org_id)
        SELECT ?, o.name, o.website, o.industry, d.org_id
        FROM deals d
        INNER JOIN organizations o ON d.org_id = o.org_id
        WHERE d.deal_id = ?
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          website = VALUES(website),
          industry = VALUES(industry)
        `,
        [orgId, dealId]
      );

      // c. Log activity
      await connection.execute(
        `INSERT INTO deal_activities (deal_id, activity_text, performed_by_user_id)
         VALUES (?, ?, ?)`,
        [dealId, `🏆 Deal marked as WON. Client company record created/updated for onboarding.`, userId]
      );
    }

    // 4. Lost-specific activity
    else if (stageName === 'Lost') {
      await connection.execute(
        `INSERT INTO deal_activities (deal_id, activity_text, performed_by_user_id)
         VALUES (?, ?, ?)`,
        [dealId, `❌ Deal marked as LOST. Reason: ${lostReason || 'Not specified'}`, userId]
      );
    }

    // 5. Regular stage move activity
    else {
      await connection.execute(
        `INSERT INTO deal_activities (deal_id, activity_text, performed_by_user_id)
         VALUES (?, ?, ?)`,
        [dealId, `Deal moved to "${stageName}" stage.`, userId]
      );
    }

    // 6. Add note if provided
    if (noteText && noteText.trim() !== '') {
      await connection.execute(
        `INSERT INTO deal_notes (deal_id, note_text, created_by_user_id)
         VALUES (?, ?, ?)`,
        [dealId, noteText.trim(), userId]
      );
    }

    await connection.commit();
    return { success: true, stage: stageName, dealId };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};



const deleteDeal = async (dealId, orgId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify deal belongs to this CRM org via created_by_user_id
    const [dealRows] = await connection.execute(
      `SELECT d.deal_id FROM deals d
       INNER JOIN users u ON d.created_by_user_id = u.id
       WHERE d.deal_id = ? AND u.org_id = ?`,
      [dealId, orgId]
    );

    if (dealRows.length === 0) {
      throw new Error("Deal not found or unauthorized");
    }

    // Delete Notes
    await connection.execute(
      `
      DELETE FROM deal_notes
      WHERE deal_id = ?
      `,
      [dealId]
    );

    // Delete Activities
    await connection.execute(
      `
      DELETE FROM deal_activities
      WHERE deal_id = ?
      `,
      [dealId]
    );

    // Delete Deal
    const [result] = await connection.execute(
      `
      DELETE FROM deals
      WHERE deal_id = ?
      `,
      [dealId]
    );

    await connection.commit();
    return result;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


const getDealNotes = async (dealId, orgId) => {
  // Filter by CRM org via created_by_user_id join (deals.org_id = client's org)
  const [rows] = await pool.execute(
    `
    SELECT dn.*
    FROM deal_notes dn
    INNER JOIN deals d ON dn.deal_id = d.deal_id
    INNER JOIN users u ON d.created_by_user_id = u.id
    WHERE dn.deal_id = ? AND u.org_id = ?
    ORDER BY dn.created_at ASC
    `,
    [dealId, orgId]
  );

  return rows;
};


const addDealNote = async (dealId, orgId, noteData) => {
  const { note_text, created_by_user_id } = noteData;

  // Verify deal belongs to CRM org
  const [dealRows] = await pool.execute(
    `SELECT d.deal_id FROM deals d
     INNER JOIN users u ON d.created_by_user_id = u.id
     WHERE d.deal_id = ? AND u.org_id = ?`,
    [dealId, orgId]
  );

  if (dealRows.length === 0) throw new Error("Deal not found or unauthorized");

  const [result] = await pool.execute(
    `INSERT INTO deal_notes (deal_id, note_text, created_by_user_id) VALUES (?, ?, ?)`,
    [dealId, note_text, created_by_user_id]
  );

  return result;
};


const deleteDealNote = async (noteId, orgId) => {
  const [noteRows] = await pool.execute(
    `
    SELECT dn.note_id
    FROM deal_notes dn
    INNER JOIN deals d ON dn.deal_id = d.deal_id
    WHERE dn.note_id = ? AND d.org_id = ?
    `,
    [noteId, orgId]
  );

  if (noteRows.length === 0) {
    throw new Error("Note not found or unauthorized");
  }

  const [result] = await pool.execute(
    `
    DELETE FROM deal_notes
    WHERE note_id = ?
    `,
    [noteId]
  );

  return result;
};


const getDealActivities = async (dealId, orgId) => {
  const [rows] = await pool.execute(
    `
    SELECT da.*
    FROM deal_activities da
    INNER JOIN deals d ON da.deal_id = d.deal_id
    INNER JOIN users u ON d.created_by_user_id = u.id
    WHERE da.deal_id = ? AND u.org_id = ?
    ORDER BY da.created_at ASC
    `,
    [dealId, orgId]
  );

  return rows;
};



const addDealActivity = async (dealId, orgId, activityData) => {
  const { activity_text, performed_by_user_id } = activityData;

  // Verify deal belongs to CRM org
  const [dealRows] = await pool.execute(
    `SELECT d.deal_id FROM deals d
     INNER JOIN users u ON d.created_by_user_id = u.id
     WHERE d.deal_id = ? AND u.org_id = ?`,
    [dealId, orgId]
  );

  if (dealRows.length === 0) throw new Error("Deal not found or unauthorized");

  const [result] = await pool.execute(
    `INSERT INTO deal_activities (deal_id, activity_text, performed_by_user_id) VALUES (?, ?, ?)`,
    [dealId, activity_text, performed_by_user_id]
  );

  return result;
};


const createStage = async (orgId, stageData) => {
  const { name, sort_order } = stageData;
  const [result] = await pool.execute(
    `
    INSERT INTO pipeline_stages
    (org_id, name, sort_order)
    VALUES (?, ?, ?)
    `,
    [orgId, name, sort_order]
  );
  return {
    success: true,
    stage_id: result.insertId
  };
};

// =========================================
// Delete Pipeline Stage
// =========================================
const deleteStage = async (stageId, orgId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Find a fallback stage in the same organization
    const [fallbackRows] = await connection.execute(
      `
      SELECT stage_id
      FROM pipeline_stages
      WHERE org_id = ? AND stage_id != ?
      LIMIT 1
      `,
      [orgId, stageId]
    );

    if (fallbackRows.length === 0) {
      throw new Error("Cannot delete the last remaining stage of the pipeline.");
    }

    const fallbackStageId = fallbackRows[0].stage_id;

    // Move deals in this stage to the fallback stage
    await connection.execute(
      `
      UPDATE deals
      SET stage_id = ?
      WHERE stage_id = ? AND org_id = ?
      `,
      [fallbackStageId, stageId, orgId]
    );

    // Delete the stage
    const [result] = await connection.execute(
      `
      DELETE FROM pipeline_stages
      WHERE stage_id = ? AND org_id = ?
      `,
      [stageId, orgId]
    );

    await connection.commit();
    return result;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


const getAllDeals = async (orgId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      d.deal_id,
      d.org_id,
      d.stage_id,
      d.contact_id,
      d.deal_name,
      d.company_name,
      d.value,
      d.contact_executive_id,
      d.dev_progress,
      d.lost_reason,
      d.created_at,
      d.updated_at,

      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.job_title

    FROM deals d

    LEFT JOIN contacts c
      ON d.contact_id = c.contact_id

    INNER JOIN users u
      ON d.created_by_user_id = u.id

    WHERE u.org_id = ?
    ORDER BY d.created_at DESC
    `,
    [orgId]
  );
  return rows;
};

module.exports = {
  getPipeline,
  getDealById,
  createDeal,
  updateDeal,
  moveDeal,
  deleteDeal,
  getDealNotes,
  addDealNote,
  deleteDealNote,
  getDealActivities,
  addDealActivity,
  createStage,
  deleteStage,
  getAllDeals
};
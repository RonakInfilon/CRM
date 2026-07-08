const pool = require("../config/database");


// l.lead_id AS LeadID,
// c.first_name AS FirstName,
// c.last_name AS LastName,
// o.name AS Organization,
// l.status AS Status,
const createLead = async (leadData) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      salutation,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      organization,
      website,
      territory,
      industry,
      source,
      status,
      notes,
      assignedToUserId = null,
      createdByUserId = null, // logged-in user's ID — used to bifurcate by org
      orgId: userOrgId,       // the CRM user's org_id (NOT the client's org)
      companyId = null,
    } = leadData;
    //create organization
    const [orgResult] = await connection.execute(
      `Insert into organizations (
      name,website,territory,industry,source) VALUES (?,?,?,?,?)`,
      [organization, website, territory, industry, source]
    );

    const orgId = orgResult.insertId;

    // NOTE: Pipeline stages are NOT created here.
    // Stages belong to the CRM org (Super Admin's org), not the client org.
    // The CRM org already has fixed 5 stages: Opportunity, Proposal Sent, Negotiation, Won, Lost.


    // create contact

    const [contactResult] = await connection.execute(
      `Insert into contacts
      (
        org_id,company_id,Salutation,first_name,last_name,email,phone,job_title,contact_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Lead')`,
      [orgId, companyId, salutation, firstName, lastName, email, phone, jobTitle,
      ]
    )
    const contactId = contactResult.insertId;

    //create lead — store created_by_user_id so we can filter by CRM org later
    const [leadResult] = await connection.execute(
      `
      INSERT INTO leads
      (
        org_id, contact_id, status, assigned_to_user_id, created_by_user_id
      )
      VALUES (?, ?, ?, ?, ?)`,
      [orgId, contactId, status || "New", assignedToUserId, createdByUserId]
    );

    const leadId = leadResult.insertId;
    //create lead note
    if (notes && notes.trim() !== "") {
      await connection.execute(
        `
        INSERT INTO lead_notes
        (lead_id,note_text,created_by_user_id)
        VALUES (?, ?, ?)`,
        [leadId, notes, createdByUserId,]
      );
    }
    await connection.commit();
    return {
      success: true,
      leadId,
      message: "Lead created successfully",
    };

  }
  catch (error) {
    await connection.rollback();
    throw error;
  }
  finally {
    connection.release();
  }
}
const getAllLeads = async ({
  orgId,     // the logged-in user's CRM org_id
  userId,    // the logged-in user's ID (used as fallback filter)
  page = 1,
  limit = 10,
  search = "",
  status = ""
}) => {
  const offset = (page - 1) * limit;

  // Filter leads by the CRM org: join leads -> created_by_user_id -> users -> org_id
  // This correctly separates leads of Company A from Company B even though
  // leads.org_id stores the *client* org (not the CRM user's org)
  let query = `
SELECT
    l.lead_id AS LeadID,
    c.Salutation,
    c.first_name AS FirstName,
    c.last_name AS LastName,
    c.email AS Email,
    c.phone AS Phone,
    c.job_title AS JobTitle,

    o.name AS Organization,
    o.website AS Website,
    o.industry AS Industry,
    o.Territory AS Territory,
    o.Source AS Source,

    l.status AS Status,

    (
        SELECT note_text
        FROM lead_notes ln
        WHERE ln.lead_id = l.lead_id
        ORDER BY ln.created_at DESC
        LIMIT 1
    ) AS Notes,

    l.created_at AS CreatedAt

FROM leads l

INNER JOIN organizations o
    ON l.org_id = o.org_id

INNER JOIN contacts c
    ON l.contact_id = c.contact_id

INNER JOIN users u
    ON l.created_by_user_id = u.id

WHERE l.isPresent = 1
  AND u.org_id = ?
`;

  const values = [orgId];

  if (search) {
    query += `
    AND (
      c.first_name LIKE ?
      OR c.last_name LIKE ?
      OR o.name LIKE ?
      OR c.email LIKE ?
    )
    `;
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword, keyword);
  }
  if (status) {
    query += ` AND l.status = ? `;
    values.push(status);
  }

  query += `
      ORDER BY l.created_at DESC
      LIMIT ?
      OFFSET ?
  `;

  values.push(Number(limit));
  values.push(Number(offset));

  const [rows] = await pool.execute(query, values);

  // Total Count — same JOIN logic
  let countQuery = `
      SELECT COUNT(*) AS total

      FROM leads l

      INNER JOIN organizations o
          ON l.org_id = o.org_id

      INNER JOIN contacts c
          ON l.contact_id = c.contact_id

      INNER JOIN users u
          ON l.created_by_user_id = u.id

      WHERE l.isPresent = 1
        AND u.org_id = ?
  `;
  const countValues = [orgId];

  if (search) {
    countQuery += `
      AND (
        c.first_name LIKE ?
        OR c.last_name LIKE ?
        OR o.name LIKE ?
        OR c.email LIKE ?
      )
    `;
    const keyword = `%${search}%`;
    countValues.push(keyword, keyword, keyword, keyword);
  }

  if (status) {
    countQuery += ` AND l.status = ? `;
    countValues.push(status);
  }

  const [[count]] = await pool.execute(countQuery, countValues);

  return {
    total: count.total,
    page: Number(page),
    limit: Number(limit),
    leads: rows,
  };
}
//get single lead
const getLeadById = async (leadId) => {
  const [rows] = await pool.execute(
    `
    SELECT

        l.lead_id as LeadID,

        c.contact_id,
        c.Salutation,
        c.first_name as FirstName,
        c.last_name as LastName,
        c.email,
        c.phone,
        c.job_title,

        o.org_id,
        o.name AS Organization,
        o.website,
        o.Territory,
        o.industry,
        o.Source,

        l.status as Status,
        l.assigned_to_user_id,

        (
            SELECT note_text
            FROM lead_notes ln
            WHERE ln.lead_id = l.lead_id
            ORDER BY ln.created_at DESC
            LIMIT 1
        ) AS notes,

        l.created_at,
        l.updated_at

    FROM leads l

    INNER JOIN organizations o
        ON l.org_id = o.org_id

    INNER JOIN contacts c
        ON l.contact_id = c.contact_id

    WHERE l.lead_id = ?
    `,
    [leadId]
  );

  return rows[0];
};
//update lead
const updateLead = async (leadId, leadData) => {
  const connection = await pool.getConnection();

  try {

    await connection.beginTransaction();
    console.log("Here")
    const {
      salutation,
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      organization,
      website,
      territory,
      industry,
      source,
      status,
      notes,
      assignedToUserId = null,
    } = leadData;



    const [[lead]] = await connection.execute(
      `
      SELECT org_id, contact_id
      FROM leads
      WHERE lead_id = ?
      `,
      [leadId]
    );

    if (!lead) {
      throw new Error("Lead not found");
    }



    await connection.execute(
      `
      UPDATE organizations
      SET

      name=?,
      website=?,
      Territory=?,
      industry=?,
      Source=?

      WHERE org_id=?
      `,
      [
        organization,
        website,
        territory,
        industry,
        source,
        lead.org_id,
      ]
    );


    await connection.execute(
      `
      UPDATE contacts

      SET

      Salutation=?,
      first_name=?,
      last_name=?,
      email=?,
      phone=?,
      job_title=?

      WHERE contact_id=?
      `,
      [
        salutation,
        firstName,
        lastName,
        email,
        phone,
        jobTitle,
        lead.contact_id,
      ]
    );



    await connection.execute(
      `
      UPDATE leads

      SET

      status=?,
      assigned_to_user_id=?

      WHERE lead_id=?
      `,
      [
        status,
        assignedToUserId,
        leadId,
      ]
    );


    const [[existingNote]] = await connection.execute(
      `
      SELECT note_id
      FROM lead_notes
      WHERE lead_id=?
      `,
      [leadId]
    );

    if (existingNote) {
      await connection.execute(
        `
        UPDATE lead_notes

        SET note_text=?

        WHERE lead_id=?
        `,
        [
          notes,
          leadId,
        ]
      );
    } else if (notes && notes.trim() !== "") {
      await connection.execute(
        `
        INSERT INTO lead_notes
        (
            lead_id,
            note_text
        )
        VALUES (?,?)
        `,
        [
          leadId,
          notes,
        ]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: "Lead Updated Successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
//delete lead — soft delete so history (notes, activities) is preserved
const deleteLead = async (leadId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE leads SET isPresent = 0 WHERE lead_id = ?`,
      [leadId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Lead not found");
    }

    await connection.commit();

    return {
      success: true,
      message: "Lead deleted successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
//update lead status
const updateLeadStatus = async (leadId, status) => {
  const [result] = await pool.execute(
    `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
    `,
    [status, leadId]
  );

  return result;
};

// qualifyLead — converts a lead into a deal on the CRM pipeline
// userOrgId: the CRM user's org (used to find pipeline stages)
// createdByUserId: logged-in user's ID (stored on deal for filtering + activity)
const qualifyLead = async (leadId, userOrgId, createdByUserId = null) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get Lead Details (client org info)
    const [leadRows] = await connection.execute(
      `
      SELECT
          l.org_id,
          l.contact_id,
          o.name AS company_name,
          o.website,
          o.industry,
          o.Source AS source
      FROM leads l
      INNER JOIN organizations o ON l.org_id = o.org_id
      WHERE l.lead_id = ?
      `,
      [leadId]
    );

    if (leadRows.length === 0) throw new Error("Lead not found");
    const lead = leadRows[0];

    // 2. Get the FIRST pipeline stage from the CRM org's fixed stages
    //    (NOT from the client org — client orgs don't have stages anymore)
    const [stageRows] = await connection.execute(
      `
      SELECT stage_id, name
      FROM pipeline_stages
      WHERE org_id = ?
      ORDER BY sort_order ASC
      LIMIT 1
      `,
      [userOrgId]
    );

    if (stageRows.length === 0) {
      throw new Error("No pipeline stages found for your organization. Please contact Super Admin.");
    }
    const { stage_id: stageId, name: stageName } = stageRows[0];

    // 3. Check if deal already exists for this contact
    const [existingDeal] = await connection.execute(
      `SELECT deal_id FROM deals WHERE contact_id = ? LIMIT 1`,
      [lead.contact_id]
    );

    let dealId;

    if (existingDeal.length === 0) {
      // 4. Create deal — link to client org (org_id) for company info
      //    but use created_by_user_id to tie it to the CRM org for filtering
      const [dealResult] = await connection.execute(
        `
        INSERT INTO deals
        (
            org_id,
            stage_id,
            contact_id,
            deal_name,
            company_name,
            value,
            dev_progress,
            created_by_user_id,
            assigned_to_user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          lead.org_id,       // client org (for company info linkage)
          stageId,           // first stage of CRM org pipeline
          lead.contact_id,
          `${lead.company_name} Deal`,
          lead.company_name,
          0,
          0,
          createdByUserId,
          createdByUserId
        ]
      );
      dealId = dealResult.insertId;

      // 5. Auto-log activity: deal created
      await connection.execute(
        `INSERT INTO deal_activities (deal_id, activity_text, performed_by_user_id)
         VALUES (?, ?, ?)`,
        [dealId, `Lead qualified — deal created and placed in "${stageName}" stage.`, createdByUserId]
      );
    } else {
      dealId = existingDeal[0].deal_id;
    }

    // 6. Mark lead as Qualified and hide from leads list
    await connection.execute(
      `UPDATE leads SET status = 'Qualified', isPresent = FALSE WHERE lead_id = ?`,
      [leadId]
    );

    await connection.commit();
    return { success: true, dealId };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  deleteLead,
  updateLead,
  updateLeadStatus,
  qualifyLead
}
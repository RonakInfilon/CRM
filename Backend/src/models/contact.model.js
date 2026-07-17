const pool = require("../config/database");

const getAllContacts = async ({ orgId, search = "", page = 1, limit = 100 }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT 
      c.contact_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.job_title,
      c.role,
      c.contact_status,
      c.org_id,
      c.company_id,
      cc.name AS Company_name
    FROM contacts c
    LEFT JOIN client_companies cc ON (c.company_id = cc.company_id OR (c.company_id IS NULL AND c.org_id = cc.linked_org_id))
    WHERE (c.org_id = ? OR cc.org_id = ?)
  `;
  
  const params = [orgId, orgId];

  if (search && search.trim() !== "") {
    query += ` AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR cc.name LIKE ?)`;
    const searchWildcard = `%${search.trim()}%`;
    params.push(searchWildcard, searchWildcard, searchWildcard, searchWildcard);
  }

  query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  return rows;
};

const getContactById = async (contactId, orgId) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      c.contact_id,
      c.first_name,
      c.last_name,
      c.email,
      c.phone,
      c.job_title,
      c.role,
      c.contact_status,
      c.org_id,
      c.company_id,
      cc.name AS Company_name
    FROM contacts c
    LEFT JOIN client_companies cc ON (c.company_id = cc.company_id OR (c.company_id IS NULL AND c.org_id = cc.linked_org_id))
    WHERE c.contact_id = ? AND (c.org_id = ? OR cc.org_id = ?)
    `,
    [contactId, orgId, orgId]
  );
  return rows.length ? rows[0] : null;
};

const createContact = async (orgId, contactData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    job_title,
    role,
    company_id,
    contact_status
  } = contactData;
//here motive of targetOrgId is to find comapny for client like if deal is companted then trafetOrgid is there company
  let targetOrgId = null;

  if (company_id) {
    const [[cc]] = await pool.execute(
      `SELECT linked_org_id FROM client_companies WHERE company_id = ?`,
      [company_id]
    );
    if (cc) {
      targetOrgId = cc.linked_org_id;
    }
  }
  if (!targetOrgId) {
    // Let's find first client_company for this org to fall back
    const [[ccFallback]] = await pool.execute(
      //here org_id is user who logedin..if i m super admin then it my id as org_id
      `SELECT linked_org_id FROM client_companies WHERE org_id = ? LIMIT 1`,
      [orgId]
    );
    if (ccFallback) {
      targetOrgId = ccFallback.linked_org_id;
    } else {
      // Create a default organization for orphan contacts if needed, or use orgId itself
      
      targetOrgId = orgId; 
    }
  }

  const [result] = await pool.execute(
    `
    INSERT INTO contacts 
      (org_id, company_id, first_name, last_name, email, phone, job_title, role, contact_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      targetOrgId,
      company_id || null,
      first_name,
      last_name,
      email,
      phone || null,
      job_title || null,
      role || null,
      contact_status || 'Won Contact'
    ]
  );

  return {
    contact_id: result.insertId,
    success: true
  };
};

const updateContact = async (contactId, orgId, contactData) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    job_title,
    role,
    company_id,
    contact_status
  } = contactData;

  // Verify ownership of the contact
  const [[existing]] = await pool.execute(
    `
    SELECT c.contact_id 
    FROM contacts c
    LEFT JOIN client_companies cc ON (c.company_id = cc.company_id OR (c.company_id IS NULL AND c.org_id = cc.linked_org_id))
    WHERE c.contact_id = ? AND (c.org_id = ? OR cc.org_id = ?)
    `,
    [contactId, orgId, orgId]
  );

  if (!existing) {
    throw new Error("Contact not found or unauthorized");
  }

  // Find linked org_id if company_id changed
  let targetOrgId = null;
  if (company_id) {
    const [[cc]] = await pool.execute(
      `SELECT linked_org_id FROM client_companies WHERE company_id = ?`,
      [company_id]
    );
    if (cc) {
      targetOrgId = cc.linked_org_id;
    }
  }

  await pool.execute(
    `
    UPDATE contacts 
    SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      phone = ?, 
      job_title = ?, 
      role = ?,
      company_id = ?,
      org_id = COALESCE(?, org_id),
      contact_status = ?
    WHERE contact_id = ?
    `,
    [
      first_name,
      last_name,
      email,
      phone || null,
      job_title || null,
      role || null,
      company_id || null,
      targetOrgId,
      contact_status || 'Won Contact',
      contactId
    ]
  );

  return { success: true };
};

const deleteContact = async (contactId, orgId) => {
  const [[existing]] = await pool.execute(
    `
    SELECT c.contact_id 
    FROM contacts c
    LEFT JOIN client_companies cc ON (c.company_id = cc.company_id OR (c.company_id IS NULL AND c.org_id = cc.linked_org_id))
    WHERE c.contact_id = ? AND (c.org_id = ? OR cc.org_id = ?)
    `,
    [contactId, orgId, orgId]
  );

  if (!existing) {
    throw new Error("Contact not found or unauthorized");
  }

  // Delete deals referencing this contact first to avoid RESTRICT constraint failure
  await pool.execute(`DELETE FROM deals WHERE contact_id = ?`, [contactId]);

  await pool.execute(`DELETE FROM contacts WHERE contact_id = ?`, [contactId]);
  return { success: true };
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};

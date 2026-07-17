const pool = require("../config/database");

const getAllCompanies = async ({ orgId, search = "", status = "", page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let searchWildcard = null;
  let query = `
    SELECT 
      company_id AS org_id,
      name AS organization_name,
      website,
      industry,
      company_size,
      annual_revenue,
      phone,
      city,
      country,
      billing_address,
      status,
      created_at,
      updated_at,
      1 AS isPresent
    FROM client_companies
    WHERE org_id = ?
  `;
  const params = [orgId];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search && search.trim() !== "") {
    query += ` AND (name LIKE ? OR industry LIKE ? OR city LIKE ?)`;
    searchWildcard = `%${search.trim()}%`;
    params.push(searchWildcard, searchWildcard, searchWildcard);
  }

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) AS total 
    FROM client_companies 
    WHERE org_id = ?
  `;
  const countParams = [orgId];
  if (status) {
    countQuery += ` AND status = ?`;
    countParams.push(status);
  }
  if (search && search.trim() !== "") {
    countQuery += ` AND (name LIKE ? OR industry LIKE ? OR city LIKE ?)`;
    countParams.push(searchWildcard, searchWildcard, searchWildcard);
  }

  const [[{ total }]] = await pool.execute(countQuery, countParams);

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  
  return {
    organizations: rows,
    total
  };
};

const getCompanyById = async (companyId, orgId) => {
  const [rows] = await pool.execute(
    `
    SELECT 
      company_id AS org_id,
      name AS organization_name,
      website,
      industry,
      company_size,
      annual_revenue,
      phone,
      city,
      country,
      billing_address,
      status,
      created_at,
      updated_at,
      1 AS isPresent
    FROM client_companies
    WHERE company_id = ? AND org_id = ?
    `,
    [companyId, orgId]
  );
  return rows.length ? rows[0] : null;
};

const createCompany = async (orgId, companyData) => {
  const {
    organization_name,
    website,
    industry,
    company_size,
    annual_revenue,
    phone,
    city,
    country,
    billing_address,
    status
  } = companyData;

  // Insert a client's own organization row to link with linked_org_id if it represents a tenant,
  // or simply insert into client_companies directly.
  // When adding a custom organization, we also need to generate a corresponding organizations row for integrity:
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create client org in organizations first
    const [orgResult] = await connection.execute(
      `INSERT INTO organizations (name, status) VALUES (?, ?)`,
      [organization_name, 'active']
    );
    const clientOrgId = orgResult.insertId;

    const [result] = await connection.execute(
      `
      INSERT INTO client_companies 
        (org_id, name, website, industry, company_size, annual_revenue, phone, city, country, billing_address, status, linked_org_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orgId,
        organization_name,
        website || null,
        industry || null,
        company_size || null,
        annual_revenue || 0,
        phone || null,
        city || null,
        country || null,
        billing_address || null,
        status || 'Active',
        clientOrgId
      ]
    );

    // Also populate pipeline stages for this company's org so deals can be linked later if needed
    await connection.execute(
      `
      INSERT INTO pipeline_stages (org_id, name, sort_order)
      VALUES
        (?, 'Opportunity', 0),
        (?, 'Negotiation', 1),
        (?, 'Won', 2),
        (?, 'Lost', 3)
      `,
      [clientOrgId, clientOrgId, clientOrgId, clientOrgId]
    );

    await connection.commit();
    return {
      company_id: result.insertId,
      org_id: result.insertId, // for frontend compatibility
      success: true
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateCompany = async (companyId, orgId, companyData) => {
  const {
    organization_name,
    website,
    industry,
    company_size,
    annual_revenue,
    phone,
    city,
    country,
    billing_address,
    status
  } = companyData;

  // Update in database
    const [result] = await pool.execute(
    `
    UPDATE client_companies 
    SET 
      name = ?, 
      website = ?, 
      industry = ?, 
      company_size = ?,
      annual_revenue = ?, 
      phone = ?, 
      city = ?, 
      country = ?, 
      billing_address = ?, 
      status = ?
    WHERE company_id = ? AND org_id = ?
    `,
    [
      organization_name,
      website || null,
      industry || null,
      company_size || null,
      annual_revenue || 0,
      phone || null,
      city || null,
      country || null,
      billing_address || null,
      status || 'Active',
      companyId,
      orgId
    ]
  );

  return { success: true, affectedRows: result.affectedRows };
};

const deleteCompany = async (companyId, orgId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Find company to get its linked_org_id
    const [[company]] = await connection.execute(
      `SELECT linked_org_id FROM client_companies WHERE company_id = ? AND org_id = ?`,
      [companyId, orgId]
    );

    if (!company) {
      throw new Error("Company not found or unauthorized");
    }

    // Delete deals referencing the contacts of this company first to avoid RESTRICT constraint failure
    const params = [companyId];
    let deleteDealsQuery = `DELETE FROM deals WHERE contact_id IN (SELECT contact_id FROM contacts WHERE company_id = ?`;
    if (company.linked_org_id) {
      deleteDealsQuery += ` OR org_id = ?`;
      params.push(company.linked_org_id);
    }
    deleteDealsQuery += `)`;
    await connection.execute(deleteDealsQuery, params);

    // Delete client company
    await connection.execute(
      `DELETE FROM client_companies WHERE company_id = ? AND org_id = ?`,
      [companyId, orgId]
    );

    // If there is a linked_org_id, clean up the associated tenant organizations table
    if (company.linked_org_id) {
      await connection.execute(
        `DELETE FROM organizations WHERE org_id = ?`,
        [company.linked_org_id]
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};

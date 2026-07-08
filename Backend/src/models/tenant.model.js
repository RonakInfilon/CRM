const db = require("../config/database");

const getTenants = async (orgId) => {
  // If the user is Super Admin, return the client companies they created
  // so they can create credentials for them.
  const [rows] = await db.query(
    `
    SELECT
      linked_org_id AS tenant_id,
      name AS company_name
    FROM client_companies
    WHERE org_id = ? AND linked_org_id IS NOT NULL AND status = 'Active'
    `,
    [orgId]
  );
  return rows;
};
module.exports = {
  getTenants
};
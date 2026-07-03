const db = require("../config/database");

const getTenants = async () => {
  const [rows] = await db.query(`
      SELECT
      org_id AS tenant_id,
      name AS company_name
      FROM organizations
      WHERE status='active'
  `);

  return rows;
};

module.exports = {
  getTenants
};
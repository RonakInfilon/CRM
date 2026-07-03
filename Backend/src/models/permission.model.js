const db = require("../config/database");

const getOrganizations = async () => {
  const [rows] = await db.query(
    "SELECT org_id, name FROM organizations"
  );
  return rows;
};

const getOrganizationPermissions = async () => {
  const [rows] = await db.query(
    "SELECT * FROM organization_permissions"
  );
  return rows;
};

const getRolePermissions = async () => {
  const [rows] = await db.query(`
    SELECT rp.*, o.name AS companyName
    FROM role_permissions rp
    JOIN organizations o
    ON rp.org_id = o.org_id
  `);

  return rows;
};

const getOrganizationId = async (companyName) => {
  const [rows] = await db.query(
    "SELECT org_id FROM organizations WHERE name=?",
    [companyName]
  );

  return rows;
};

const saveOrganizationPermission = async (
  orgId,
  dashboard,
  leads,
  pipeline,
  contacts,
  companies,
  userManagement
) => {

  return db.query(
    `INSERT INTO organization_permissions
    (
      org_id,
      module_dashboard,
      module_leads,
      module_pipeline,
      module_contacts,
      module_companies,
      module_user_management
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      module_dashboard=VALUES(module_dashboard),
      module_leads=VALUES(module_leads),
      module_pipeline=VALUES(module_pipeline),
      module_contacts=VALUES(module_contacts),
      module_companies=VALUES(module_companies),
      module_user_management=VALUES(module_user_management)`,

    [
      orgId,
      dashboard,
      leads,
      pipeline,
      contacts,
      companies,
      userManagement
    ]
  );
};

const saveRolePermission = async (
  orgId,
  role,
  dashboard,
  leads,
  pipeline,
  contacts,
  companies,
  userManagement
) => {

  return db.query(
    `INSERT INTO role_permissions
    (
      org_id,
      role,
      module_dashboard,
      module_leads,
      module_pipeline,
      module_contacts,
      module_companies,
      module_user_management
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      module_dashboard=VALUES(module_dashboard),
      module_leads=VALUES(module_leads),
      module_pipeline=VALUES(module_pipeline),
      module_contacts=VALUES(module_contacts),
      module_companies=VALUES(module_companies),
      module_user_management=VALUES(module_user_management)`,

    [
      orgId,
      role,
      dashboard,
      leads,
      pipeline,
      contacts,
      companies,
      userManagement
    ]
  );
};

module.exports = {
  getOrganizations,
  getOrganizationPermissions,
  getRolePermissions,
  getOrganizationId,
  saveOrganizationPermission,
  saveRolePermission
};
const db = require("../config/database");

const moduleColumnMapping = {
  'Dashboard': 'module_dashboard',
  'Leads': 'module_leads',
  'Pipeline': 'module_pipeline',
  'Contacts': 'module_contacts',
  'Companies': 'module_companies',
  'Permission': 'module_user_management',
  'Users': 'module_user_management'
};

const checkModulePermission = (moduleName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Super Admin bypasses all checks
    if (req.user.role === "Super Admin") {
      return next();
    }

    const orgId = req.user.org_id;
    if (!orgId) {
      return res.status(403).json({ message: "Forbidden: User is not assigned to any organization" });
    }

    const permissionColumn = moduleColumnMapping[moduleName];
    if (!permissionColumn) {
      return res.status(400).json({ message: `Invalid module check requested: ${moduleName}` });
    }

    try {
      const [rows] = await db.query(
        `SELECT ?? FROM organization_permissions WHERE org_id = ?`,
        [permissionColumn, orgId]
      );

      if (rows.length === 0 || !rows[0][permissionColumn]) {
        return res.status(403).json({
          message: `Forbidden: The ${moduleName} module is not enabled for your organization`
        });
      }

      next();
    } catch (err) {
      console.error(`Error in module permission check for ${moduleName}:`, err);
      return res.status(500).json({ message: "Internal server error verifying permission" });
    }
  };
};

const enforceOrgBoundary = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role === "Super Admin") {
    req.org_id = null;
    return next();
  }

  req.org_id = req.user.org_id;
  if (!req.org_id) {
    return res.status(403).json({ message: "Forbidden: No organization assigned to user profile" });
  }
  next();
};

module.exports = {
  checkModulePermission,
  enforceOrgBoundary
};

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Super Admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Only Super Admin can perform this action" });
};

const canCreateUser = (req, res, next) => {
  const creatorRole = req.user.role;
  const { role: targetRole, org_id: targetOrgId } = req.body;

  // 1. Super Admin has full authorization to create any role/company user
  if (creatorRole === "Super Admin") {
    return next();
  }

  // 2. Company Admin can create Managers and Company Employees for their own company
  if (creatorRole === "Company Admin") {
    if (targetRole !== "Manager" && targetRole !== "Company Employee") {
      return res.status(403).json({ 
        message: "Forbidden: Company Admins can only create Managers or Company Employees." 
      });
    }

    // Convert to numbers or compare directly
    if (targetOrgId && Number(targetOrgId) !== Number(req.user.org_id)) {
      return res.status(403).json({ 
        message: "Forbidden: You can only create users belonging to your own company." 
      });
    }

    return next();
  }

  // 3. Manager and Company Employee cannot create users
  return res.status(403).json({ 
    message: "Forbidden: You do not have permission to create users." 
  });
};

module.exports = {
  isSuperAdmin,
  canCreateUser
};

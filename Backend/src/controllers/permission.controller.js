const {
  getOrganizations,
  getOrganizationPermissions,
  getRolePermissions,
  getOrganizationId,
  saveOrganizationPermission,
  saveRolePermission,
} = require("../models/permission.model");

const getPermissions = async (req, res) => {
  try {
    const orgs = await getOrganizations();
    const perms = await getOrganizationPermissions();

    const companyModules = {};

    for (const org of orgs) {
      const perm = perms.find((p) => p.org_id === org.org_id);

      const modules = [];

      if (perm) {
        if (perm.module_dashboard) modules.push("Dashboard");
        if (perm.module_leads) modules.push("Leads");
        if (perm.module_pipeline) modules.push("Pipeline");
        if (perm.module_contacts) modules.push("Contacts");
        if (perm.module_companies) modules.push("Activity");
        if (perm.module_drag_drop) modules.push("Drag & Drop");
        if (perm.module_user_management) modules.push("Permission");
      }

      companyModules[org.name] = modules;
    }

    const rolePermsRows = await getRolePermissions();

    const rolePermissions = {};

    for (const row of rolePermsRows) {
      const key = `${row.companyName}_${row.role}`;

      const modules = [];

      if (row.module_dashboard) modules.push("Dashboard");
      if (row.module_leads) modules.push("Leads");
      if (row.module_pipeline) modules.push("Pipeline");
      if (row.module_contacts) modules.push("Contacts");
      if (row.module_companies) modules.push("Activity");
      if (row.module_drag_drop) modules.push("Drag & Drop");
      if (row.module_user_management) modules.push("Permission");

      rolePermissions[key] = modules;
    }

    res.status(200).json({
      success: true,
      companyModules,
      rolePermissions,
    });

  } catch (err) {
    console.error("Failed to fetch permissions:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updatePermissions = async (req, res) => {
  try {
    const { companyName, role, modules } = req.body;

    if (!companyName || !role || !Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
    }

    const orgs = await getOrganizationId(companyName);

    if (orgs.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Organization '${companyName}' not found`,
      });
    }

    const orgId = orgs[0].org_id;

    const dashboard = modules.includes("Dashboard") ? 1 : 0;
    const leads = modules.includes("Leads") ? 1 : 0;
    const pipeline = modules.includes("Pipeline") ? 1 : 0;
    const contacts = modules.includes("Contacts") ? 1 : 0;
    const companies = modules.includes("Activity") ? 1 : 0;
    const dragDrop = modules.includes("Drag & Drop") ? 1 : 0;
    const userMgmt = modules.includes("Permission") ? 1 : 0;

    if (role === "company_level") {
      await saveOrganizationPermission(
        orgId,
        dashboard,
        leads,
        pipeline,
        contacts,
        companies,
        dragDrop,
        userMgmt
      );
    } else {
      await saveRolePermission(
        orgId,
        role,
        dashboard,
        leads,
        pipeline,
        contacts,
        companies,
        dragDrop,
        userMgmt
      );
    }

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
    });

  } catch (err) {
    console.error("Failed to update permissions:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getPermissions,
  updatePermissions,
};
const { getTenants } = require("../models/tenant.model");

const getTenantsList = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const tenants = await getTenants(orgId);

    res.status(200).json({
      success: true,
      data: tenants,
    });

  } catch (err) {
    console.error("Failed to fetch tenant list:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getTenantsList,
};
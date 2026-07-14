const ApiLog = require("../models/logs.schema");

const getLogs = async (req, res) => {
  try {
    const { role, org_id } = req.user;

    let query = {};

    // Determine filtering based on user role
    if (role === "Super Admin") {
      // Super Admin can filter by any org_id if passed in query params, or see all if not specified
      if (req.query.org_id) {
        query.org_id = Number(req.query.org_id);
      }
    } else if (role === "Company Admin") {
      // Company Admin is strictly restricted to their own organization's logs
      query.org_id = Number(org_id);
    } else {
      // Other roles (Managers, Employees) are not permitted to view audit logs
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view logs."
      });
    }

    // Support pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ApiLog.find(query)
      .sort({ time: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ApiLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get Logs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

module.exports = {
  getLogs
};

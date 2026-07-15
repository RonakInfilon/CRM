const Lead = require("../models/lead.model");
const ApiLog = require("../models/logs.schema");
const { userEmail } = require("../models/user.model");
//get all leads
const getAllLeads = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email)
    if (!user) {
      console.log("User is not found");
    }
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const role = req.user.role;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;
    const leads = await Lead.getAllLeads({
      orgId,
      userId,
      role,
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
    return res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,

    });
  }
};

//get lead by id
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const role = req.user.role;

    const lead = await Lead.getLeadById(id, orgId, userId, role);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//create lead
const createLead = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email)
    if (!user) {
      console.log("User is not found");
    }
    const orgId = req.user.org_id;
    const userId = req.user.id; // logged-in user's ID
    const result = await Lead.createLead({ ...req.body, orgId, createdByUserId: userId });
    console.log(req.body);
    await ApiLog.create({
      action: `${user.name} create a new lead:"${req.body.firstName}"  (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    })
    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//update lead
const updateLead = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email)
    if (!user) {
      console.log("User is not found");
    }
    const { id } = req.params;
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const role = req.user.role;

    const existingLead = await Lead.getLeadById(id, orgId, userId, role);
    if (!existingLead) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or Lead not found"
      });
    }

    const result = await Lead.updateLead(id, req.body);
    await ApiLog.create({
      action: `${user.name} update a new lead : "${req.body.firstName}"    (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    })
    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//update lead status
const updateLeadStatus = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }

    const { id } = req.params;
    const { status } = req.body;
    const orgId = req.user.org_id;
    const userId = req.user.id; 
    const role = req.user.role;

    const existingLead = await Lead.getLeadById(id, orgId, userId, role);
    if (!existingLead) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or Lead not found"
      });
    }

     const leadName = existingLead.FirstName || "Unknown Lead";

    if (status === "Qualified") {
      console.log("Calling qualifyLead...");
      await ApiLog.create({
        // Uses the database-fetched name instead of req.body
        action: `${user.name} updated "${leadName}" status to qualified (Role:${user.role})`,
        name: user.name,
        email: user.email,
        org_id: user.org_id
      });
      await Lead.qualifyLead(id, orgId, userId);
    } else {
      await ApiLog.create({
        action: `${user.name} updated "${leadName}" status to ${status} (Role:${user.role})`,
        name: user.name,
        email: user.email,
        org_id: user.org_id
      });
      await Lead.updateLeadStatus(id, status);
    }

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//delete lead
const deleteLead = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { id } = req.params;
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const role = req.user.role;

    const existingLead = await Lead.getLeadById(id, orgId, userId, role);
    console.log(existingLead);
    if (!existingLead) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or Lead not found"
      });
    }

    const leadName = existingLead.FirstName || "Unknown Lead";

    await Lead.deleteLead(id, orgId);
    
    await ApiLog.create({
      // Uses the saved name string variable safely
      action: `${user.name} deleted lead: "${leadName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });
    
    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
const Lead = require("../models/lead.model");

//get all leads
const getAllLeads = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    const leads = await Lead.getAllLeads({
      orgId,
      userId,
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

    const lead = await Lead.getLeadById(id, orgId);

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
    const orgId = req.user.org_id;
    const userId = req.user.id; // logged-in user's ID
    const result = await Lead.createLead({ ...req.body, orgId, createdByUserId: userId });

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
    const { id } = req.params;
    const orgId = req.user.org_id;

    const result = await Lead.updateLead(id, orgId, req.body);

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
    console.log("Controller reached");
    console.log(req.body);
    
    const { id } = req.params;
    const { status } = req.body;
    const orgId = req.user.org_id;
    const userId = req.user.id; // logged-in user's ID

    console.log("Status =", status);

    if (status === "Qualified") {
      console.log("Calling qualifyLead...");
      // Pass CRM user's org_id so qualifyLead uses the correct pipeline stages
      await Lead.qualifyLead(id, orgId, userId);
    } else {
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
    const { id } = req.params;
    const orgId = req.user.org_id;

    await Lead.deleteLead(id, orgId);

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
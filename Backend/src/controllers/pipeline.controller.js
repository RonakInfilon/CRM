const Pipeline = require("../models/pipeline.model.js");
const ApiLog = require("../models/logs.schema.js");
const { userEmail } = require("../models/user.model.js");
const getPipeline = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const pipeline = await Pipeline.getPipeline(orgId);

    return res.status(200).json({
      success: true,
      message: "Pipeline fetched successfully",
      data: pipeline,
    });

  } catch (error) {
    console.error("Get Pipeline Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const deal = await Pipeline.getDealById(id, orgId);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: deal,
    });

  } catch (error) {
    console.error("Get Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const createDeal = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const orgId = req.user.org_id;
    const dealData = { ...req.body, org_id: orgId };
    const result = await Pipeline.createDeal(dealData);
    console.log(result);

    await ApiLog.create({
      action: `${user.name} created a new deal: "${req.body.deal_name || req.body.dealName || 'Unnamed Deal'}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: result,
    });

  } catch (error) {
    console.error("Create Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateDeal = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { id } = req.params;
    const orgId = req.user.org_id;

    const existingDeal = await Pipeline.getDealById(id, orgId);
    const dealName = existingDeal ? (existingDeal.deal_name || "Unnamed Deal") : "Unknown Deal";

    const result = await Pipeline.updateDeal(id, orgId, req.body);

    await ApiLog.create({
      action: `${user.name} updated deal: "${dealName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      data: result,
    });

  } catch (error) {
    console.error("Update Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const moveDeal = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { id } = req.params;
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const { stage_id, lost_reason = null, note_text = null } = req.body;

    const existingDeal = await Pipeline.getDealById(id, orgId);
    const dealName = existingDeal ? (existingDeal.deal_name || "Unnamed Deal") : "Unknown Deal";

    const result = await Pipeline.moveDeal(id, orgId, userId, stage_id, lost_reason, note_text);

    await ApiLog.create({
      action: `${user.name} moved deal "${dealName}" to "${result.stage}" stage (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(200).json({
      success: true,
      message: `Deal moved to "${result.stage}" stage successfully`,
      data: result,
    });

  } catch (error) {
    console.error("Move Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const deleteDeal = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { id } = req.params;
    const orgId = req.user.org_id;

    const existingDeal = await Pipeline.getDealById(id, orgId);
    const dealName = existingDeal ? (existingDeal.deal_name || "Unnamed Deal") : "Unknown Deal";

    await Pipeline.deleteDeal(id, orgId);

    await ApiLog.create({
      action: `${user.name} deleted deal: "${dealName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });

  } catch (error) {
    console.error("Delete Deal Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getDealNotes = async (req, res) => {
  try {
    const { dealId } = req.params;
    const orgId = req.user.org_id;

    const notes = await Pipeline.getDealNotes(dealId, orgId);

    return res.status(200).json({
      success: true,
      data: notes,
    });

  } catch (error) {
    console.error("Get Notes Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const addDealNote = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { dealId } = req.params;
    const orgId = req.user.org_id;
    const createdByUserId = req.user.id;

    const existingDeal = await Pipeline.getDealById(dealId, orgId);
    const dealName = existingDeal ? (existingDeal.deal_name || "Unnamed Deal") : "Unknown Deal";

    const result = await Pipeline.addDealNote(dealId, orgId, {
      ...req.body,
      created_by_user_id: createdByUserId
    });

    await ApiLog.create({
      action: `${user.name} added a note to deal "${dealName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: result,
    });

  } catch (error) {
    console.error("Add Note Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDealNote = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { noteId } = req.params;
    const orgId = req.user.org_id;
    console.log(noteId);
    console.log(orgId)
    await Pipeline.deleteDealNote(noteId, orgId);

    await ApiLog.create({
      action: `${user.name} deleted deal note (ID: ${noteId}) (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });

  } catch (error) {
    console.error("Delete Note Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDealActivities = async (req, res) => {
  try {
    const { dealId } = req.params;
    const orgId = req.user.org_id;

    const activities = await Pipeline.getDealActivities(dealId, orgId);

    return res.status(200).json({
      success: true,
      data: activities,
    });

  } catch (error) {
    console.error("Get Activities Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addDealActivity = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { dealId } = req.params;
    const orgId = req.user.org_id;
    const performedByUserId = req.user.id;

    const existingDeal = await Pipeline.getDealById(dealId, orgId);
    const dealName = existingDeal ? (existingDeal.deal_name || "Unnamed Deal") : "Unknown Deal";

    const result = await Pipeline.addDealActivity(dealId, orgId, {
      ...req.body,
      performed_by_user_id: performedByUserId
    });

    await ApiLog.create({
      action: `${user.name} logged activity on deal "${dealName}": "${req.body.activity_text || 'New Activity'}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(201).json({
      success: true,
      message: "Activity added successfully",
      data: result,
    });

  } catch (error) {
    console.error("Add Activity Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const createStage = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const orgId = req.user.org_id;
    const result = await Pipeline.createStage(orgId, req.body);

    await ApiLog.create({
      action: `${user.name} created a new pipeline stage: "${req.body.name || 'Unnamed Stage'}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(201).json({
      success: true,
      message: "Stage created successfully",
      data: result
    });
  } catch (error) {
    console.error("Create Stage Error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: "A stage with this name already exists in your pipeline."
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const deleteStage = async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }
    const { stageId } = req.params;
    const orgId = req.user.org_id;
    await Pipeline.deleteStage(stageId, orgId);

    await ApiLog.create({
      action: `${user.name} deleted pipeline stage (ID: ${stageId}) (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

    return res.status(200).json({
      success: true,
      message: "Stage deleted successfully"
    });
  } catch (error) {
    console.error("Delete Stage Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const getAllDeals = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const deals = await Pipeline.getAllDeals(orgId);
    console.log("User:", req.user);
    console.log("Org ID:", req.user.org_id);

    return res.status(200).json({
      success: true,
      message: "Deals fetched successfully",
      data: deals
    });
  } catch (error) {
    console.error("Get All Deals Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPipeline,
  getDealById,
  createDeal,
  updateDeal,
  moveDeal,
  deleteDeal,
  getDealNotes,
  addDealNote,
  deleteDealNote,
  getDealActivities,
  addDealActivity,
  createStage,
  deleteStage,
  getAllDeals
};
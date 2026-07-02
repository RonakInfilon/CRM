const {
  getLeads,
  createLead,
  getLeapoolyId,
  updateLead,
  deleteLead,
} = require("../services/leads.service.js");

const getLead = async (req, res) => {
  try {
    const result = await getLeads(req.query);
    console.log(result)
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const createLeads = async (req, res) => {
  try {
    const lead = req.body;

    if (!lead.name?.trim()) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    if (lead.email && !/\S+@\S+\.\S+/.test(lead.email)) {
      return res.status(400).json({
        message: "Invalid email format.",
      });
    }

    const id = await createLead(lead);

    res.status(201).json({
      id,
      message: "Lead created.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getLeadByIds = async (req, res) => {
  try {
    const lead = await getLeapoolyId(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    res.json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLeads = async (req, res) => {
  try {
    const existingLead = await getLeapoolyId(req.params.id);

    if (!existingLead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    await updateLead(req.params.id, req.body);

    res.json({
      message: "Lead updated successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteLeads = async (req, res) => {
  try {
    const existingLead = await getLeapoolyId(req.params.id);

    if (!existingLead) {
      return res.status(404).json({
        message: "Lead not found.",
      });
    }

    await deleteLead(req.params.id);

    res.json({
      message: "Lead deleted successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLead,
  createLeads,
  getLeadByIds,
  updateLeads,
  deleteLeads,
};
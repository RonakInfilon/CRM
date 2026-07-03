const express = require("express");
const router = express.Router();

const leadController = require("../controllers/lead.controller");

// Get all leads
router.get("/", leadController.getAllLeads);

// Get single lead
router.get("/:id", leadController.getLeadById);

// Create lead
router.post("/", leadController.createLead);

// Update lead
router.put("/:id", leadController.updateLead);

// Update lead status
router.patch("/:id/status", leadController.updateLeadStatus);

// Delete lead
router.delete("/:id", leadController.deleteLead);

module.exports = router;
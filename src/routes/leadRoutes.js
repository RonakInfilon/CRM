const express = require("express");
const router = express.Router();
const {getLead,createLeads,getLeadByIds,updateLeads,deleteLeads} = require("../controllers/lead.controller.js");

router.get("/", getLead);
router.post("/", createLeads);
router.get("/:id", getLeadByIds);
router.put("/:id", updateLeads);
router.delete("/:id", deleteLeads);

module.exports = router;
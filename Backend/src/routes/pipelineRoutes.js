const express = require("express");
const router = express.Router();

const pipelineController = require("../controllers/pipeline.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all pipeline routes
router.use(authenticate);


// All deals list
router.get("/deals", pipelineController.getAllDeals);

// Stage operations (fixed path — must be before /:id)
router.post("/stages", pipelineController.createStage);
router.delete("/stages/:stageId", pipelineController.deleteStage);

// Note operations on a deal (fixed sub-path)
router.get("/:dealId/notes", pipelineController.getDealNotes);
router.post("/:dealId/notes", pipelineController.addDealNote);
router.delete("/notes/:noteId", pipelineController.deleteDealNote);

// Activity operations on a deal (fixed sub-path)
router.get("/:dealId/activity", pipelineController.getDealActivities);
router.post("/:dealId/activity", pipelineController.addDealActivity);

// ── Dynamic /:id routes (must come AFTER all fixed paths) 
router.get("/", pipelineController.getPipeline);
router.get("/:id", pipelineController.getDealById);
router.post("/", pipelineController.createDeal);
router.put("/:id", pipelineController.updateDeal);
router.patch("/:id/stage", pipelineController.moveDeal);
router.delete("/:id", pipelineController.deleteDeal);

module.exports = router;
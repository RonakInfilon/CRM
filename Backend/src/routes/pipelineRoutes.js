const express = require("express");
const router = express.Router();

const pipelineController = require("../controllers/pipeline.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all pipeline routes
router.use(authenticate);
router.get("/", pipelineController.getPipeline);
router.get("/deals", pipelineController.getAllDeals);
router.get("/:id", pipelineController.getDealById);
router.post("/", pipelineController.createDeal);
router.put("/:id", pipelineController.updateDeal);
router.patch("/:id/stage", pipelineController.moveDeal);
router.delete("/:id", pipelineController.deleteDeal);

router.get("/:dealId/notes", pipelineController.getDealNotes);

router.post("/:dealId/notes", pipelineController.addDealNote);

router.delete("/notes/:noteId", pipelineController.deleteDealNote);


router.get("/:dealId/activity", pipelineController.getDealActivities);

router.post("/:dealId/activity", pipelineController.addDealActivity);
// Pipeline Stage routes — must be declared BEFORE /:id routes to avoid conflict
router.post("/stages", pipelineController.createStage);
router.delete("/stages/:stageId", pipelineController.deleteStage);

module.exports = router;
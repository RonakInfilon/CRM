const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all log routes - only authenticated users can access logs
router.use(authenticate);

// Route to retrieve logs
router.get("/", logController.getLogs);

module.exports = router;

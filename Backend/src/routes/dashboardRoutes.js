const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all dashboard routes
router.use(authenticate);

// Get dashboard stats
router.get("/", dashboardController.getDashboardStats);

module.exports = router;

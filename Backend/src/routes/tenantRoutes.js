const express = require("express");
const router = express.Router();

const {
  getTenantsList,
} = require("../controllers/tenant.controller");

const authenticate = require("../middleware/auth.middleware");

// Protected Routes
router.get("/", authenticate, getTenantsList);

module.exports = router;
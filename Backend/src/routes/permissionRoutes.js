const express = require("express");
const router = express.Router();

const {
  getPermissions,
  updatePermissions,
} = require("../controllers/permission.controller");

const authenticate = require("../middleware/auth.middleware");

// Protected Routes
router.get("/", authenticate, getPermissions);
router.put("/", authenticate, updatePermissions);

module.exports = router;
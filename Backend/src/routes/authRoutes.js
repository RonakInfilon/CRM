const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getUsersList,
  createTenantUser
} = require("../controllers/auth.controller.js");
const authenticate = require("../middleware/auth.middleware");

// Public Routes
router.post("/login", login);

// Protected Routes
router.get("/users", authenticate, getUsersList);
router.post("/tenant", authenticate, createTenantUser);

module.exports = router;


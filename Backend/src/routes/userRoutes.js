const express = require("express");
const router = express.Router();

const {
  createUserByAdmin,
  getAllUsers,
  updateProfile,
} = require("../controllers/user.controller");

const authenticate = require("../middleware/auth.middleware");

// Protected Routes
router.post("/create", authenticate, createUserByAdmin);
router.get("/", authenticate, getAllUsers);
router.put("/profile", authenticate, updateProfile);

module.exports = router;
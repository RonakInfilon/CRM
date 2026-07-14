const express = require("express");
const router = express.Router();

const {
  createUserByAdmin,
  getAllUsers,
  updateProfile,
  getProfile,
  switchPersona,
} = require("../controllers/user.controller");

const authenticate = require("../middleware/auth.middleware");

// Protected Routes
router.post("/create", authenticate, createUserByAdmin);
router.get("/", authenticate, getAllUsers);
router.get("/profile", authenticate, getProfile);
//api/user/profile where it will store profile data??
router.put("/profile", authenticate, updateProfile);
router.post("/switch-persona", authenticate, switchPersona);

module.exports = router;
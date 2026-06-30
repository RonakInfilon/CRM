const express = require("express");
const router = express.Router();
const { login, signup, createUserByAdmin, getAllUsers } = require("../controllers/auth.controller.js");

const authenticateToken = require("../middleware/auth.middleware");
const { canCreateUser } = require("../middleware/role.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/create-user", authenticateToken, canCreateUser, createUserByAdmin);
router.get("/users", authenticateToken, getAllUsers);

module.exports = router;
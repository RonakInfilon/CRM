const express = require('express');
const router = express.Router();
const { createOrganization, getAllOrganizations, deleteOrganization, updateOrganization } = require("../controllers/organization.controller");

const authenticateToken = require("../middleware/auth.middleware");
const { isSuperAdmin } = require("../middleware/role.middleware");

router.get("/", getAllOrganizations);
router.post("/", authenticateToken, isSuperAdmin, createOrganization);
router.put("/:id", authenticateToken, isSuperAdmin, updateOrganization);
router.delete("/:id", authenticateToken, isSuperAdmin, deleteOrganization);

module.exports = router;
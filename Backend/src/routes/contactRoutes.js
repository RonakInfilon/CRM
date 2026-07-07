const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all contact routes
router.use(authenticate);

// CRUD operations for contacts
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);

module.exports = router;

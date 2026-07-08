const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const authenticate = require("../middleware/auth.middleware");

// Secure all company routes
router.use(authenticate);

// CRUD operations for companies
router.get("/", companyController.getAllCompanies);
router.get("/:id", companyController.getCompanyById);
router.post("/", companyController.createCompany);
router.put("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

module.exports = router;

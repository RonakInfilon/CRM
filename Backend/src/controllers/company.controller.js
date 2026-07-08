const Company = require("../models/company.model");

const getAllCompanies = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    const result = await Company.getAllCompanies({
      orgId,
      search,
      status,
      page: Number(page),
      limit: Number(limit)
    });

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Get Companies Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const company = await Company.getCompanyById(id, orgId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error("Get Company Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCompany = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const result = await Company.createCompany(orgId, req.body);

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: result
    });
  } catch (error) {
    console.error("Create Company Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const result = await Company.updateCompany(id, orgId, req.body);

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Update Company Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    await Company.deleteCompany(id, orgId);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully"
    });
  } catch (error) {
    console.error("Delete Company Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};

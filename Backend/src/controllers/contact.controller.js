const Contact = require("../models/contact.model");

const getAllContacts = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const { page = 1, limit = 100, search = "" } = req.query;

    const contacts = await Contact.getAllContacts({
      orgId,
      search,
      page: Number(page),
      limit: Number(limit)
    });

    return res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      data: contacts
    });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const contact = await Contact.getContactById(id, orgId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error("Get Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createContact = async (req, res) => {
  try {
    const orgId = req.user.org_id;
    const result = await Contact.createContact(orgId, req.body);

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: result
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    const result = await Contact.updateContact(id, orgId, req.body);

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Update Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.org_id;

    await Contact.deleteContact(id, orgId);

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully"
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
};

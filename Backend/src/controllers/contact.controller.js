const Contact = require("../models/contact.model");
const ApiLog = require("../models/logs.schema");
const { userEmail } = require("../models/user.model");

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
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }

    const orgId = req.user.org_id;
    const result = await Contact.createContact(orgId, req.body);

    const contactName = `${req.body.first_name || ""} ${req.body.last_name || ""}`.trim() || "Unnamed Contact";
    await ApiLog.create({
      action: `${user.name} created a new contact: "${contactName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

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
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }

    const { id } = req.params;
    const orgId = req.user.org_id;

    const existing = await Contact.getContactById(id, orgId);
    const contactName = existing
      ? `${existing.first_name || ""} ${existing.last_name || ""}`.trim() || "Unnamed Contact"
      : "Unknown Contact";

    const result = await Contact.updateContact(id, orgId, req.body);

    await ApiLog.create({
      action: `${user.name} updated contact: "${contactName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

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
    const { email } = req.user;
    const user = await userEmail(email);
    if (!user) {
      console.log("User is not found");
    }

    const { id } = req.params;
    const orgId = req.user.org_id;

    const existing = await Contact.getContactById(id, orgId);
    const contactName = existing
      ? `${existing.first_name || ""} ${existing.last_name || ""}`.trim() || "Unnamed Contact"
      : "Unknown Contact";

    await Contact.deleteContact(id, orgId);

    await ApiLog.create({
      action: `${user.name} deleted contact: "${contactName}" (Role:${user.role})`,
      name: user.name,
      email: user.email,
      org_id: user.org_id
    });

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

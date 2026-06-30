const Contact = require('../models/contact.model.js');

const createContact = async (req, res) => {
    try {
        const { first_name, last_name, email, job_title } = req.body;
        if (!first_name || !last_name || !email || !job_title) {
            return res.status(400).json({ success: false, message: "Required fields are missing." });
        }

        const contactId = await Contact.create(req.body);
        res.status(201).json({ success: true, message: "Contact created successfully", contactId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "This email address is already in use." });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const contacts = await Contact.findAll(limit, offset);
        res.status(200).json({ success: true, page, limit, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


const updateContact = async (req, res) => {
    try {
        const updated = await Contact.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Contact not found or fields unchanged." });
        }
        res.status(200).json({ success: true, message: "Contact updated successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteContact = async (req, res) => {
    try {
        const deleted = await Contact.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Contact not found." });
        }
        res.status(200).json({ success: true, message: "Contact removed successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


module.exports={createContact,updateContact,getAllContacts,deleteContact}
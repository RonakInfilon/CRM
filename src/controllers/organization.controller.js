const  {
    orgCreate,
    orgCountAll,
    orgFindAll,
    orgFindById,
    orgUpdate,
    orgDelete,
} =require("../models/organization.model.js")
const createOrganization = async (req, res) => {
    try {
        const { organization_name } = req.body;
        if (!organization_name) {
            return res.status(400).json({ success: false, message: "Organization name is required." });
        }

        const orgId = await orgCreate(req.body);
        res.status(201).json({ success: true, message: "Organization created successfully", orgId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getAllOrganizations = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const search = req.query.name || "";

        const [organizations, totalCount] = await Promise.all([
            orgFindAll(limit, offset,search),
            orgCountAll()
        ]);

        res.status(200).json({
            success: true,
            data: {
                organizations,
                total: totalCount
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



const updateOrganization = async (req, res) => {
    try {
        const updated = await orgUpdate(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ success: false, message: "Organization not found or no changes made" });
        }
        res.status(200).json({ success: true, message: "Organization updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteOrganization = async (req, res) => {
    try {
        const deleted = await orgDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        res.status(200).json({ success: true, message: "Organization deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports={createOrganization,getAllOrganizations,deleteOrganization,updateOrganization};
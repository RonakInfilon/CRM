const db = require("../config/database");

const orgCreate = async (orgData) => {
    const sql = `
        INSERT INTO organization
        (organization_name, website, industry, company_size,
        annual_revenue, phone, city, country, billing_address,isPresent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,true)
    `;

    const values = [
        orgData.organization_name,
        orgData.website,
        orgData.industry,
        orgData.company_size,
        orgData.annual_revenue,
        orgData.phone,
        orgData.city,
        orgData.country,
        orgData.billing_address,
    ];

    const [result] = await db.execute(sql, values);
    return result.insertId;
};

const orgCountAll = async () => {
    const sql = `
        SELECT COUNT(*) AS total
        FROM organization
        WHERE isPresent=true
    `;

    const [rows] = await db.execute(sql);
    return rows[0].total;
};

const orgFindAll = async (
    limit = 4,
    offset = 0,
    search = ""
) => {

    const sql = `
        SELECT *
        FROM organization
        WHERE isPresent = true
        AND organization_name LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await db.execute(
        sql,
        [`%${search}%`, limit, offset]
    );

    return rows;
};

const orgFindById = async (id) => {
    const sql = `SELECT * FROM organization WHERE org_id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
};

const orgUpdate = async (id, orgData) => {
    const sql = `
        UPDATE organization
        SET organization_name = ?,
            website = ?,
            industry = ?,
            company_size = ?,
            annual_revenue = ?,
            phone = ?,
            city = ?,
            country = ?,
            billing_address = ?
        WHERE org_id = ?
    `;

    const values = [
        orgData.organization_name,
        orgData.website,
        orgData.industry,
        orgData.company_size,
        orgData.annual_revenue,
        orgData.phone,
        orgData.city,
        orgData.country,
        orgData.billing_address,
        id,
    ];

    const [result] = await db.execute(sql, values);
    return result.affectedRows > 0;
};

const orgDelete = async (id) => {
    const sql = `Update organization set isPresent=false WHERE org_id = ?`;
    const [result] = await db.execute(sql, [id]);

    return result.affectedRows > 0;
};

module.exports = {
    orgCreate,
    orgCountAll,
    orgFindAll,
    orgFindById,
    orgUpdate,
    orgDelete,
};

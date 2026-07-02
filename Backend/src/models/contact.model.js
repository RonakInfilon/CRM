const db = require("../config/database");

const Contact = {
  create: async (contactData) => {
    const sql = `Insert into contacts(org_id,first_name,last_name,job_title,email,lifecycle_stage,contact_status,isPresent=true) VALUES (?,?,?,?,?,?,?)`;
    const values = [
      contactData.org_id || null,
      contactData.first_name,
      contactData.last_name,
      contactData.job_title,
      contactData.email,
      contactData.lifecycle_stage,
      contactData.contact_status,
    ];
    const [result] = await db.execute(sql, values);
    return result.insertId;
  },
  findAll: async (contactData) => {
    const sql = `SELECT c.*, o.organization_name AS Company_name 
FROM contact c 
LEFT JOIN organization o ON c.org_id = o.org_id 
WHERE c.isPresent = true
ORDER BY c.created_at DESC 
LIMIT ? OFFSET ?
`;
    const [result] = await db.execute(sql, [String(limit), String(offset)]);
    return result;
  },
  update: async (contactData) => {
    const sql = `update contacts set org_id=?,first_name=?,last_name=?,job_title=?,email=?,lifecycle_stage=?,contact_status=?  where contact_id=?`;
    const values = [
      contactData.org_id || null,
      contactData.first_name,
      contactData.last_name,
      contactData.job_title,
      contactData.email,
      contactData.lifecycle_stage,
      contactData.contact_status,
      id,
    ];
    const [result] = await pool.execute(sql, values);
    return result.affectedRows > 0;
  },
  delete: async (id) => {
    const sql = `Update table contacts set isPresent=true`;
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Contact;

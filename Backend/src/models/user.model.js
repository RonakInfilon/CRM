const db = require("../config/database");

const userEmail = async (email) => {
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.password,
      u.phone,
      u.bio,
      u.avatar,
      u.role,
      o.organization_name AS company
    FROM users u
    LEFT JOIN accounts o
      ON u.tenant_id = o.tenant_id
    WHERE u.email = ?
  `;

  const [rows] = await db.query(sql, [email]);
  return rows[0];
};

const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    role = 'Company Employee',
    org_id = null,
    phone = null,
    bio = null,
    avatar = null
  } = userData;

  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, role, org_id, phone, bio, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password, role, org_id, phone, bio, avatar]
  );
  return result;
};


const createLead = async (leadData) => {
  const {
    name,
    email,
    phone,
    company,
    source,
    status,
    assignedTo,
    notes,
  } = leadData;

  const [result] = await db.execute(
    `INSERT INTO Leads
    (Name, Email, Phone, Company, Source, Status, AssignedTo, Notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      phone,
      company,
      source,
      status,
      assignedTo,
      notes,
    ]
  );

  return result;
};

const getUsers = async (orgId = null) => {
  let sql = `
    SELECT u.id, u.name, u.email, u.phone, u.bio, u.avatar, u.role, o.organization_name AS company
    FROM users u
    LEFT JOIN organization o ON u.org_id = o.org_id
  `;
  const params = [];
  if (orgId) {
    sql += " WHERE u.org_id = ?";
    params.push(orgId);
  }
  const [rows] = await db.execute(sql, params);
  return rows;
};

module.exports = {
  userEmail,
  createUser,
  createLead,
  getUsers
};

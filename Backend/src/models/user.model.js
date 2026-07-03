const db = require("../config/database");

const userEmail = async (email) => {
  const sql = `
    SELECT
      u.id,
      u.org_id,
      u.name,
      u.email,
      u.password,
      u.phone,
      u.bio,
      u.role,
      o.name AS company
    FROM users u
    LEFT JOIN organizations o
      ON u.org_id = o.org_id
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
    role = 'Employee',
    org_id = null,
    phone = null,
    bio = null
  } = userData;

  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, role, org_id, phone, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, password, role, org_id, phone, bio]
  );
  return result;
};

const updateUserProfile = async (userId, profileData) => {
  const { name, phone, bio } = profileData;
  const [result] = await db.execute(
    `UPDATE users SET name = ?, phone = ?, bio = ? WHERE id = ?`,
    [name, phone, bio, userId]
  );
  return result.affectedRows > 0;
};

const getUsers = async (orgId = null) => {
  let sql = `
    SELECT u.id, u.name, u.email, u.phone, u.bio, u.role, o.name AS company
    FROM users u
    LEFT JOIN organizations o ON u.org_id = o.org_id
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
  updateUserProfile,
  getUsers
};

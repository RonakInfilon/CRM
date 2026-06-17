const db = require("../config/database");

const userEmail = async (email) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  return rows[0];
};

const createUser = async (name, email, password) => {
  const [result] = await db.execute(
    "INSERT INTO users(name,email,password) VALUES(?,?,?)",
    [name, email, password],
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

module.exports = {
  userEmail,
  createUser,
  createLead
};

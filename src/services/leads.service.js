const pool = require("../config/database.js");

const getLeads = async (query) => {
  const {
    page = 1,
    limit = 5,
    sort = "CreatedAt",
    order="DESC",
    id,
    name,
    email,
    company,
    source,
    status,
  } = query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const SORTABLE = [
    "LeadID",
    "Name",
    "Email",
    "Company",
    "Status",
    "CreatedAt",
  ];

  const direction=["ASC","DESC"].includes(order.toUpperCase())?order.toUpperCase():"DESC";
  const orderBy = SORTABLE.includes(sort) ? sort : "CreatedAt";

  const conditions = ["1=1"];
  const params = [];

  if (id) {
    conditions.push("LeadID = ?");
    params.push(id);
  }

if (name) {
  conditions.push("(Name LIKE ? OR Email LIKE ? OR Company LIKE ?)");
  params.push(`%${name}%`, `%${name}%`, `%${name}%`);
}

  if (email) {
    conditions.push("Email LIKE ?");
    params.push(`%${email}%`);
  }

  if (company) {
    conditions.push("Company LIKE ?");
    params.push(`%${company}%`);
  }

  if (source) {
    conditions.push("Source = ?");
    params.push(source);
  }

  if (status) {
    conditions.push("Status = ?");
    params.push(status);
  }

  const where = conditions.join(" AND ");

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM Leads
     WHERE ${where}`,
    params,
  );

  const total = countRows[0].total;

  const [leads] = await pool.query(
    `SELECT
        LeadID,
        Name,
        Email,
        Phone,
        Company,
        Source,
        Status,
        AssignedTo,
        Notes,
        CreatedAt,
        UpdatedAt
     FROM Leads
     WHERE isPresent=true AND  (${where})
     ORDER BY ${orderBy} ${direction}
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset],
  );

  return {
    leads,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

const createLead = async (lead) => {
  const {
    name,
    email,
    phone,
    company,
    source,
    status = "New",
    assignedTo,
    notes,
  } = lead;

  const [result] = await pool.query(
    `INSERT INTO Leads
    (
      Name,
      Email,
      Phone,
      Company,
      Source,
      Status,
      AssignedTo,
      Notes,
      isPresent
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,true)`,
    [
      name,
      email || null,
      phone || null,
      company || null,
      source || null,
      status,
      assignedTo || null,
      notes || null,
    ],
  );

  return result.insertId;
};

const getLeapoolyId = async (id) => {
  const [rows] = await pool.query("SELECT * FROM Leads WHERE isPresent=true AND LeadID = ? ", [id]);

  return rows.length ? rows[0] : null;
};

const updateLead = async (id, lead) => {
  const { name, email, phone, company, source, status, assignedTo, notes } =
    lead;
  console.log(lead);
  await pool.query(
    `UPDATE Leads SET
      Name=?,
      Email=?,
      Phone=?,
      Company=?,
      Source=?,
      Status=?,
      AssignedTo=?,
      Notes=?
     WHERE LeadID=?`,
    [name, email, phone, company, source, status, assignedTo, notes, id],
  );
};
const deleteLead = async (id) => {
await pool.query("UPDATE Leads SET isPresent = false WHERE LeadID = ?", [id]);
};

module.exports = {
  getLeads,
  createLead,
  getLeapoolyId,
  updateLead,
  deleteLead,
};

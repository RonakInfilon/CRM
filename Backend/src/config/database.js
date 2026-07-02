const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.Host,
  user: process.env.User,
  Password: process.env.Password,
  database: process.env.Database,
  port: process.env.Port,
  waitForConnections: true,
  connectionLimit: 10,
});

console.log("MySQL pool created");

module.exports = pool;

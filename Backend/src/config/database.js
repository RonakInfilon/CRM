const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = mysql.createPool({
  host: process.env.Host,
  user: process.env.User,
  password: process.env.Password,
  database: process.env.Database,
  port: process.env.Port,
  waitForConnections: true,
  connectionLimit: 10,
});

console.log("MySQL pool created");

module.exports = pool;

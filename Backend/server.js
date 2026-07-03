const express = require("express");
const DatabaseConfig = require("./src/config/database");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const connectMongo = require("./src/config/mongodb")
const loggerMiddleware = require("./src/middleware/logger.middleware");

const authenticateToken = require("./src/middleware/auth.middleware");
const { getTenantsList } = require("./src/controllers/auth.controller");
connectMongo();
dotenv.config();
const authRoutes=require("./src/routes/authRoutes.js");
const userRoutes=require("./src/routes/userRoutes.js");
const permissionRoutes=require("./src/routes/permissionRoutes.js");
const tenantRoutes=require("./src/routes/tenantRoutes.js");
const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());
// app.use(loggerMiddleware);
app.get("/", (req, res) => {
  res.send("Express server is responding");
});
app.get("/test", (req, res) => {
    res.json({
        message: "working"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/tenants", tenantRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

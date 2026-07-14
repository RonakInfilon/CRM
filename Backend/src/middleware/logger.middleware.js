const ApiLog = require("../models/logs.schema");

// Helper function to map HTTP requests to readable action strings matching `<name> <action> <resource>`
const getActionDescription = (method, url, userName) => {
  const cleanUrl = url.split("?")[0].toLowerCase();
  
  let verb = "see";
  if (method === "POST") verb = "create";
  else if (method === "PUT" || method === "PATCH") verb = "update";
  else if (method === "DELETE") verb = "delete";
  else if (method === "GET") verb = "see";

  // Split path into parts to identify the target resource dynamically
  const parts = cleanUrl.split("/").filter(p => p && p !== "api");
  const rawResource = parts[0] || "resource";

  // Map backend route paths to clean, proper user-facing words
  const resourceMap = {
    leads: "leads",
    contacts: "contacts", 
    companies: "companies",
    pipeline: "pipeline",
    users: "users",
    permissions: "permissions",
    tenant: "tenant",
    dashboard: "dashboard"
  };

  const resource = resourceMap[rawResource] || rawResource;

  if (cleanUrl.includes("/auth/login")) return `${userName} log in`;
  if (cleanUrl.includes("/auth/signup")) return `${userName} register`;

  return `${userName} ${verb} ${resource}`;
};

const loggerMiddleware = (req, res, next) => {
  // Prevent infinite loops and logging of the log viewing API
  if (req.originalUrl && (req.originalUrl.startsWith("/api/logs") || req.originalUrl.includes("/logs"))) {
    return next();
  }

  const originalJson = res.json;

  res.json = function (data) {
    // Prevent double logging of a single request
    if (!req.logged) {
      req.logged = true;

      // Determine user name and email from the token context, or body/query, falling back safely
      const userName = req.user?.name || (req.user?.email ? req.user.email.split("@")[0] : "guest");
      const email = req.user?.email || req.body?.email || req.query?.email || "";
      const orgId = req.user?.org_id || req.body?.org_id || req.query?.org_id || null;

      const action = getActionDescription(req.method, req.originalUrl, userName);

      // Time-based deduplication for GET requests (to prevent React StrictMode clutter)
      const handleSaveLog = async () => {
        try {
          if (req.method === "GET") {
            const timeThreshold = new Date(Date.now() - 1500);
            const duplicate = await ApiLog.findOne({
              name: userName,
              action: action,
              org_id: orgId ? Number(orgId) : null,
              time: { $gte: timeThreshold }
            });
            if (duplicate) {
              console.log(`[Logger] Ignored duplicate GET log (Strict Mode): ${action}`);
              return;
            }
          }

          await ApiLog.create({
            action: action,
            name: userName,
            email: email,
            time: new Date(),
            org_id: orgId ? Number(orgId) : null
          });
          console.log(`[Logger] Saved: ${action} (${email})`);
        } catch (err) {
          console.error("[Logger] Error saving log:", err);
        }
      };

      handleSaveLog();
    }

    return originalJson.call(this, data);
  };

  next();
};

module.exports = loggerMiddleware;
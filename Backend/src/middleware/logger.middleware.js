// const ApiLog = require("../models/logs.schema");

// const simpleLogger = (req, res, next) => {
//   // Skip auth routes since we manually log them with detailed messages in the controller
//   if (req.originalUrl && req.originalUrl.startsWith("/api/auth")) {
//     return next();
//   }

//   const originalJson = res.json;

//   res.json = async function (data) {
//     try {
//       const userName = req.user?.name || "guest";
//       const email = req.user?.email || req.body?.email || "unknown";
//       const action = `${userName} made a ${req.method} request to ${req.originalUrl}`;
//       await ApiLog.create({
//         action: action,
//         name: userName,
//         email: email,
//         time: new Date(),
//         org_id: req.user?.org_id || null
//       });

//       console.log(`[Logger] Saved: ${action}`);
//     } catch (err) {
//       console.error("[Logger] Error saving log:", err);
//     }

//     return originalJson.call(this, data);
//   };

//   next();
// };

// module.exports = simpleLogger;

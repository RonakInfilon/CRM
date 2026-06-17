const ApiLog = require("../models/logs.schema");

const loggerMiddleware = (req, res, next) => {
    const originalJson = res.json;

res.json = function (data) {
    console.log("Logger middleware triggered");

    ApiLog.create({
        method: req.method,
        endPoint: req.originalUrl,
        requestBody: req.body?.password,
        responsemessage: data?.message || ""
    })
    .then(() => console.log("Log saved"))
    .catch(err => console.error(err));

    return originalJson.call(this, data);
};

    next();
};

module.exports = loggerMiddleware;
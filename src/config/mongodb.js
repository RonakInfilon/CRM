const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const connectMongo = async () => {
  try {
    console.log("Mongo URI exists:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
  }
};

module.exports = connectMongo;
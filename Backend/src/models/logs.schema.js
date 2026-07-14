const mongoose = require("mongoose");

const logschema = new mongoose.Schema({
  action: String,
  name: String,
  email: String,
  time: {
    type: Date,
    default: Date.now
  },
  org_id: Number
});

module.exports = mongoose.model("ApiLog", logschema);

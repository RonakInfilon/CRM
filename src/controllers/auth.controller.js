const authservice = require("../services/auth.service.js");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const result = await authservice.signup(
      name,
      email,
      password
    );

    res.status(201).json(result);

  } catch (err) {
    console.error(err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login body:", req.body);

    const { email, password } = req.body;

    const result = await authservice.login(email, password);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);

    res.status(401).json({
      message: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
};
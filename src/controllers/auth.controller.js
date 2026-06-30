const authservice = require("../services/auth.service.js");

const signup = async (req, res) => {
  try {
    const { name, email, password,role, org_id,phone,bio } = req.body;

    const result = await authservice.signup(
      name,
      email,
      password,
      role,
      org_id,
      phone,
      bio
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

const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, org_id, phone, bio } = req.body;

    const result = await authservice.signup(
      name,
      email,
      password,
      role,
      org_id,
      phone,
      bio
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

const getAllUsers = async (req, res) => {
  try {
    const result = await authservice.listUsers(req.user);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(403).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
  createUserByAdmin,
  getAllUsers
};
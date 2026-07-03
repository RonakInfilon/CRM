const bcrypt = require("bcrypt");

const {
  userEmail,
  createUser,
  getUsers,
  updateUserProfile,
} = require("../models/user.model.js");

// Create User by Admin
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, org_id, phone, bio } = req.body;

    // Check if user already exists
    const existingUser = await userEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      org_id,
      phone,
      bio,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === "Company Admin") {
      users = await getUsers(req.user.org_id);
    } else if (req.user.role === "Super Admin") {
      users = await getUsers(null);
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to user directory",
      });
    }

    res.status(200).json({
      success: true,
      data: users,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio } = req.body;

    const success = await updateUserProfile(userId, {
      name,
      phone,
      bio,
    });

    if (!success) {
      return res.status(400).json({
        success: false,
        message: "Failed to update user profile",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (err) {
    console.error("Profile update controller error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createUserByAdmin,
  getAllUsers,
  updateProfile,
};
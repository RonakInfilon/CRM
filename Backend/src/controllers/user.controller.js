const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const ApiLog = require("../models/logs.schema");

const {
  userEmail,
  createUser,
  getUsers,
  updateUserProfile,
  getUserById,
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

    await ApiLog.create({
      action: `${req.user.name} created a new user: "${name}" with role "${role}" (Role:${req.user.role})`,
      name: req.user.name,
      email: req.user.email,
      org_id: req.user.org_id
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

    await ApiLog.create({
      action: `${req.user.name} updated their profile (Role:${req.user.role})`,
      name: req.user.name,
      email: req.user.email,
      org_id: req.user.org_id
    });

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

// Get Profile Details
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        role: user.role,
        company: user.company || "All",
      },
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Switch Persona & Re-sign Token
const switchPersona = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, company } = req.body;

    let org_id = null;
    if (role === "Super Admin") {
      const [orgs] = await db.query("SELECT org_id FROM organizations ORDER BY org_id ASC LIMIT 1");
      if (orgs.length > 0) {
        org_id = orgs[0].org_id;
      }
    } else {
      const [orgs] = await db.query("SELECT org_id FROM organizations WHERE name = ?", [company]);
      if (orgs.length > 0) {
        org_id = orgs[0].org_id;
      }
    }

    await db.execute(
      `UPDATE users SET role = ?, org_id = ? WHERE id = ?`,
      [role, org_id, userId]
    );

    // Fetch the updated user details to sign the new token
    const user = await getUserById(userId);

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        org_id: user.org_id
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    await ApiLog.create({
      action: `${req.user.name} switched persona to role "${role}"${company ? ` at "${company}"` : ""} (Role:${req.user.role})`,
      name: req.user.name,
      email: req.user.email,
      org_id: req.user.org_id
    });

    res.status(200).json({
      success: true,
      message: "Persona updated in database successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: "",
        role: user.role,
        company: user.company || "All"
      }
    });
  } catch (err) {
    console.error("Switch Persona Error:", err);
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
  getProfile,
  switchPersona,
};
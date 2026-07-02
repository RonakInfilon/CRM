const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userEmail, createUser, getUsers } = require("../models/user.model.js");

const signup = async (name, email, password, role, org_id, phone, bio) => {
  const existingUser = await userEmail(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await createUser({
    name,
    email,
    password: hashedPassword,
    role,      
    org_id,    
    phone,
    bio
  });

  return {
    message: "user Created",
  };
};


const login = async (email, password) => {
  const user = await userEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      org_id: user.org_id
    },
    process.env.SecreatKey,
    { expiresIn: "1d" }
  );

  // Super Admin has bypass access to all companies
  const companyName = user.role === "Super Admin" ? "All" : (user.company || "");

  return {
    message: "Login successful",
    token,
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      role: user.role,
      company: companyName
    }
  };
};

const listUsers = async (requestingUser) => {
  if (requestingUser.role === "Company Admin") {
    return await getUsers(requestingUser.org_id);
  }
  if (requestingUser.role === "Super Admin") {
    return await getUsers(null);
  }
  throw new Error("Unauthorized access to user directory");
};

module.exports = { signup, login, listUsers };

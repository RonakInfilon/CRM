const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userEmail, createUser } = require("../models/user.model.js");

const signup = async (name, email, password) => {
  const existingUser = await userEmail(email);
 if (existingUser) {
  throw new Error("User already exists");
}

  const hashedPassword = await bcrypt.hash(password, 10);
  await createUser(name, email, hashedPassword);
  return {
    message: "user Created",
  };
};

const login = async (email, password) => {
  const user = await userEmail(email);
  console.log(user);

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("Password not found for this user");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.SecreatKey,
    {
      expiresIn: "1d",
    },
  );

  return {
    message: "Login successful",
    token,
  };
};

module.exports = { signup, login };

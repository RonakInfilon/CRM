const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const {
    userEmail,
    createUser
} = require("../models/user.model");

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            org_id,
            phone,
            bio
        } = req.body;

        const existingUser = await userEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
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

        res.status(201).json({
            success: true,
            message: "User Created"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await userEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
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

        const companyName =
            user.role === "Super Admin"
                ? "All"
                : user.company || "";

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                bio: user.bio || "",
                avatar: "",
                role: user.role,
                company: companyName
            }
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};








module.exports = {
  signup,
  login,
};
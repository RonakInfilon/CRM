const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");
const {
    userEmail,
    createUser,
    getUsers
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
        //if user is already existing then it will give error because evey email is unique
        const existingUser = await userEmail(email);
        //this will give error
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        //it will hash the passworf for seacurity
        const hashedPassword = await bcrypt.hash(password, 10);
        //it will createUser using query...here create user is present in user.model.js
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
            process.env.SECRET_KEY,
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

const getUsersList = async (req, res) => {
    try {
        const currentUserRole = req.user.role;
        const currentOrgId = req.user.org_id;

        // Super Admin gets all users, Company Admin gets only their company's users
        const orgIdFilter = currentUserRole === "Super Admin" ? null : currentOrgId;
        const users = await getUsers(orgIdFilter);

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error("Get Users List Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const createTenantUser = async (req, res) => {
    try {
        const { name, email, password, role, org_id, phone, bio } = req.body;
        const currentUserRole = req.user.role;
        const currentOrgId = req.user.org_id;

        // If not Super Admin, lock org_id to caller's org_id
        const targetOrgId = currentUserRole === "Super Admin" ? org_id : currentOrgId;

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
            org_id: targetOrgId,
            phone,
            bio
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully"
        });
    } catch (err) {
        console.error("Create Tenant User Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
  signup,
  login,
  getUsersList,
  createTenantUser
};
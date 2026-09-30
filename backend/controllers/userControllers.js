// controllers/userControllers.js

const {
    users,
    getNextUserId
} = require("../Data/store");

// ==================================================
// CREATE USER
// POST /api/users
// ==================================================
const createUser = (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check duplicate email
        const existingUser = users.find(
            user => user.email === normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Create user
        const newUser = {
            id: getNextUserId(),
            name: name.trim(),
            email: normalizedEmail,
            password: password
        };

        users.push(newUser);

        // Don't send password to frontend
        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: safeUser
        });

    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==================================================
// LOGIN USER
// POST /api/users/login
// ==================================================
const loginUser = (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            !email.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = users.find(
            item => item.email === normalizedEmail
        );

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: safeUser
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==================================================
// GET ALL USERS
// GET /api/users
// ==================================================
const getAllUsers = (req, res) => {
    try {
        const safeUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email
        }));

        return res.status(200).json({
            success: true,
            count: safeUsers.length,
            users: safeUsers
        });

    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


module.exports = {
    createUser,
    loginUser,
    getAllUsers
};
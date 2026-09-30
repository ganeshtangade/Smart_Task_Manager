// routes/userRoutes.js

const express = require("express");

const {
    createUser,
    loginUser,
    getAllUsers
} = require("../controllers/userControllers");

const router = express.Router();

// Create user
router.post("/", createUser);

// Login
router.post("/login", loginUser);

// Get all users
router.get("/", getAllUsers);

module.exports = router;
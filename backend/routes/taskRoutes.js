// routes/taskRoutes.js

const express = require("express");

const {
    createTask,
    getAllTasks,
    getTaskById,
    getTasksForUser,
    getBlockedTasks,
    updateTask,
    deleteTask,
    completeTask
} = require("../controllers/taskControllers");

const router = express.Router();

// Blocked tasks
router.get("/blocked", getBlockedTasks);

// Tasks for a user
router.get("/user/:userId", getTasksForUser);

// Create task
router.post("/", createTask);

// Get all tasks
router.get("/", getAllTasks);

// Get one task
router.get("/:id", getTaskById);

// Update task
router.put("/:id", updateTask);

// Delete task
router.delete("/:id", deleteTask);

// Complete task
router.patch("/:id/complete", completeTask);

module.exports = router;
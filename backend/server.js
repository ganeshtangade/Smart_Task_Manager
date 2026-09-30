// Import Express framework
// Express is used to create our backend server and API routes
const express = require("express");

// Import CORS
// CORS allows our frontend (localhost:3000 / Vercel)
// to communicate with our backend
const cors = require("cors");

// Import user routes
// These routes handle registration, login and getting users
const userRoutes = require("./routes/userRoutes");

// Import task routes
// These routes handle creating, updating, deleting,
// completing and viewing tasks
const taskRoutes = require("./routes/taskRoutes");


// Create an Express application
const app = express();


// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

// Enable CORS
// This allows requests from our frontend application
app.use(cors());

// Parse incoming JSON data
// Example: { "name": "Ganesh", "email": "..." }
app.use(express.json());


// --------------------------------------------------
// HOME / HEALTH CHECK ROUTE
// --------------------------------------------------

// This route is used to check whether the backend is running
app.get("/", (req, res) => {
    res.json({
        message: "Smart Task Manager Backend is running"
    });
});


// --------------------------------------------------
// USER API ROUTES
// --------------------------------------------------

// All user routes start with:
// /api/users
//
// Examples:
// POST /api/users
// POST /api/users/login
// GET  /api/users

app.use("/api/users", userRoutes);


// --------------------------------------------------
// TASK API ROUTES
// --------------------------------------------------

// All task routes start with:
// /api/tasks
//
// Examples:
// POST   /api/tasks
// GET    /api/tasks
// PUT    /api/tasks/:id
// DELETE /api/tasks/:id
// PATCH  /api/tasks/:id/complete

app.use("/api/tasks", taskRoutes);


// --------------------------------------------------
// PORT
// --------------------------------------------------

// Render provides the PORT using an environment variable.
//
// When running locally:
// process.env.PORT may not exist,
// so we use 5000.
//
// Therefore:
// Local  -> http://localhost:5000
// Render -> Render's assigned PORT

const PORT = process.env.PORT || 5000;


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

// Start the server
//
// "0.0.0.0" allows the deployed server to accept
// connections from outside the local computer.
//
// This is important when deploying to Render.

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
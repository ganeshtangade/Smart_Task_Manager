// server.js

const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const PORT = 5000;


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());

app.use(express.json());


// ==================================================
// ROOT ROUTE
// ==================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Smart Task Manager Backend is running"
    });

});


// ==================================================
// USER ROUTES
// ==================================================

app.use(
    "/api/users",
    userRoutes
);


// ==================================================
// TASK ROUTES
// ==================================================

app.use(
    "/api/tasks",
    taskRoutes
);


// ==================================================
// 404 ROUTE
// ==================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message:
            `Route not found: ${req.method} ${req.originalUrl}`
    });

});


// ==================================================
// ERROR HANDLER
// ==================================================

app.use((err, req, res, next) => {

    console.error(
        "Unhandled error:",
        err
    );

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ==================================================
// START SERVER
// ==================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);

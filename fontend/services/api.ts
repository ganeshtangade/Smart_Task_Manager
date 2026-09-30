// --------------------------------------------------
// Smart Task Manager API Service
// --------------------------------------------------

// For local development:
// http://localhost:5000/api
//
// For the deployed application:
// https://smart-task-manager-55a9.onrender.com/api
//
// We use an environment variable when available.
// If it is not available, localhost is used.

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";


// --------------------------------------------------
// COMMON RESPONSE HANDLER
// --------------------------------------------------

async function handleResponse(response: Response) {
    try {
        // Convert the server response into JSON
        const data = await response.json();

        // If HTTP status is not successful
        if (!response.ok) {
            return {
                success: false,
                message:
                    data.message ||
                    "Request failed",
                ...data,
            };
        }

        // Return successful response
        return data;

    } catch (error) {
        console.error(
            "Response parsing error:",
            error
        );

        return {
            success: false,
            message:
                "Invalid response from server",
        };
    }
}


// ==================================================
// USER APIs
// ==================================================


// --------------------------------------------------
// CREATE USER
// POST /api/users
// --------------------------------------------------

export async function createUser(userData: {
    name: string;
    email: string;
    password: string;
}) {
    const response = await fetch(
        `${API_URL}/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        }
    );

    return handleResponse(response);
}


// --------------------------------------------------
// LOGIN USER
// POST /api/users/login
// --------------------------------------------------

export async function loginUser(loginData: {
    email: string;
    password: string;
}) {
    const response = await fetch(
        `${API_URL}/users/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        }
    );

    return handleResponse(response);
}


// --------------------------------------------------
// GET ALL USERS
// GET /api/users
// --------------------------------------------------

export async function getUsers() {
    const response = await fetch(
        `${API_URL}/users`
    );

    return handleResponse(response);
}


// ==================================================
// TASK APIs
// ==================================================


// --------------------------------------------------
// GET ALL TASKS
// GET /api/tasks
// --------------------------------------------------

export async function getTasks() {
    const response = await fetch(
        `${API_URL}/tasks`
    );

    return handleResponse(response);
}


// --------------------------------------------------
// GET MY TASKS
// GET /api/tasks/user/:userId
// --------------------------------------------------

export async function getMyTasks(
    userId: number
) {
    const response = await fetch(
        `${API_URL}/tasks/user/${userId}`
    );

    return handleResponse(response);
}


// --------------------------------------------------
// GET BLOCKED TASKS
// GET /api/tasks/blocked
// --------------------------------------------------

export async function getBlockedTasks() {
    const response = await fetch(
        `${API_URL}/tasks/blocked`
    );

    return handleResponse(response);
}


// --------------------------------------------------
// GET SINGLE TASK
// GET /api/tasks/:id
// --------------------------------------------------

export async function getTask(
    taskId: number
) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}`
    );

    return handleResponse(response);
}


// --------------------------------------------------
// CREATE TASK
// POST /api/tasks
// --------------------------------------------------

export async function createTask(taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    assignedTo: number | null;
    dependencyId: number | null;
}) {
    const response = await fetch(
        `${API_URL}/tasks`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        }
    );

    return handleResponse(response);
}


// --------------------------------------------------
// UPDATE TASK
// PUT /api/tasks/:id
// --------------------------------------------------

export async function updateTask(
    taskId: number,
    taskData: {
        title?: string;
        description?: string;
        priority?: string;
        status?: string;
        assignedTo?: number | null;
        dependencyId?: number | null;
    }
) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        }
    );

    return handleResponse(response);
}


// --------------------------------------------------
// DELETE TASK
// DELETE /api/tasks/:id
// --------------------------------------------------

export async function deleteTask(
    taskId: number
) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            method: "DELETE",
        }
    );

    return handleResponse(response);
}


// --------------------------------------------------
// COMPLETE TASK
// PATCH /api/tasks/:id/complete
// --------------------------------------------------

export async function completeTask(
    taskId: number
) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}/complete`,
        {
            method: "PATCH",
        }
    );

    return handleResponse(response);
}
const API_URL = "http://localhost:5000/api";

async function handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
        return {
            success: false,
            message: data.message || "Something went wrong",
            ...data,
        };
    }

    return data;
}

// ==================================================
// USER APIs
// ==================================================

export async function createUser(userData: {
    name: string;
    email: string;
    password: string;
}) {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    return handleResponse(response);
}

export async function loginUser(loginData: {
    email: string;
    password: string;
}) {
    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
    });

    return handleResponse(response);
}

export async function getUsers() {
    const response = await fetch(`${API_URL}/users`, {
        cache: "no-store",
    });

    return handleResponse(response);
}

// ==================================================
// TASK APIs
// ==================================================

export async function getTasks() {
    const response = await fetch(`${API_URL}/tasks`, {
        cache: "no-store",
    });

    return handleResponse(response);
}

export async function getMyTasks(userId: number) {
    const response = await fetch(
        `${API_URL}/tasks/user/${userId}`,
        {
            cache: "no-store",
        }
    );

    return handleResponse(response);
}

export async function getBlockedTasks() {
    const response = await fetch(
        `${API_URL}/tasks/blocked`,
        {
            cache: "no-store",
        }
    );

    return handleResponse(response);
}

export async function getTask(taskId: number) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            cache: "no-store",
        }
    );

    return handleResponse(response);
}

export async function createTask(taskData: {
    title: string;
    description: string;
    priority: string;
    status: string;
    assignedTo: number | null;
    dependencyId: number | null;
}) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
    });

    return handleResponse(response);
}

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

export async function deleteTask(taskId: number) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
            method: "DELETE",
        }
    );

    return handleResponse(response);
}

export async function completeTask(taskId: number) {
    const response = await fetch(
        `${API_URL}/tasks/${taskId}/complete`,
        {
            method: "PATCH",
        }
    );

    return handleResponse(response);
}
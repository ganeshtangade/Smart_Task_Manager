// controllers/taskControllers.js

const {
    tasks,
    users,
    getNextTaskId
} = require("../Data/store");

const ALLOWED_PRIORITIES = [
    "Low",
    "Medium",
    "High"
];

const ALLOWED_STATUSES = [
    "To Do",
    "In Progress",
    "Done"
];


// ==================================================
// HELPER: PARSE ID
// ==================================================
function parseId(value) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }

    return id;
}


// ==================================================
// HELPER: FIND USER
// ==================================================
function findUserById(userId) {
    const id = parseId(userId);

    if (!id) {
        return null;
    }

    return users.find(user => user.id === id) || null;
}


// ==================================================
// HELPER: FIND TASK
// ==================================================
function findTaskById(taskId) {
    const id = parseId(taskId);

    if (!id) {
        return null;
    }

    return tasks.find(task => task.id === id) || null;
}


// ==================================================
// HELPER: CHECK DEPENDENCY
// ==================================================
function getDependencyInfo(task) {

    // No dependency
    if (task.dependencyId === null) {
        return {
            blocked: false,
            dependency: null,
            message: null
        };
    }

    const dependency =
        findTaskById(task.dependencyId);

    // Dependency not found
    if (!dependency) {
        return {
            blocked: true,
            dependency: null,
            message: "Dependency task does not exist"
        };
    }

    // Dependency exists but is not complete
    if (dependency.status !== "Done") {
        return {
            blocked: true,
            dependency,
            message:
                `Task is blocked because dependency task #${dependency.id} is not completed`
        };
    }

    return {
        blocked: false,
        dependency,
        message: null
    };
}


// ==================================================
// HELPER: CHECK CIRCULAR DEPENDENCY
// ==================================================
function hasCircularDependency(taskId, dependencyId) {

    const originalTaskId = parseId(taskId);

    let currentId = parseId(dependencyId);

    const visited = new Set();

    while (currentId !== null) {

        // Task depends on itself indirectly
        if (currentId === originalTaskId) {
            return true;
        }

        // Prevent infinite loop
        if (visited.has(currentId)) {
            return true;
        }

        visited.add(currentId);

        const currentTask =
            findTaskById(currentId);

        if (
            !currentTask ||
            currentTask.dependencyId === null
        ) {
            return false;
        }

        currentId =
            currentTask.dependencyId;
    }

    return false;
}


// ==================================================
// HELPER: FORMAT TASK
// ==================================================
function formatTask(task) {

    const assignedUser =
        task.assignedTo !== null
            ? findUserById(task.assignedTo)
            : null;

    const dependencyInfo =
        getDependencyInfo(task);

    return {
        ...task,

        assignedUser: assignedUser
            ? {
                id: assignedUser.id,
                name: assignedUser.name,
                email: assignedUser.email
            }
            : null,

        dependency: dependencyInfo.dependency
            ? {
                id: dependencyInfo.dependency.id,
                title: dependencyInfo.dependency.title,
                status: dependencyInfo.dependency.status
            }
            : null,

        blocked: dependencyInfo.blocked
    };
}


// ==================================================
// CREATE TASK
// POST /api/tasks
// ==================================================
const createTask = (req, res) => {

    try {

        const {
            title,
            description = "",
            priority = "Medium",
            status = "To Do",
            assignedTo = null,
            dependencyId = null
        } = req.body;


        // ------------------------------------------
        // Validate title
        // ------------------------------------------
        if (
            typeof title !== "string" ||
            !title.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Task title is required"
            });
        }


        // ------------------------------------------
        // Validate priority
        // ------------------------------------------
        if (
            !ALLOWED_PRIORITIES.includes(priority)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Priority must be Low, Medium or High"
            });
        }


        // ------------------------------------------
        // Validate status
        // ------------------------------------------
        if (
            !ALLOWED_STATUSES.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be To Do, In Progress or Done"
            });
        }


        // ------------------------------------------
        // Validate assigned user
        // ------------------------------------------
        let normalizedAssignedTo = null;

        if (
            assignedTo !== null &&
            assignedTo !== undefined
        ) {

            normalizedAssignedTo =
                parseId(assignedTo);

            if (!normalizedAssignedTo) {
                return res.status(400).json({
                    success: false,
                    message:
                        "assignedTo must be a valid user id"
                });
            }

            if (
                !findUserById(
                    normalizedAssignedTo
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assigned user does not exist"
                });
            }
        }


        // ------------------------------------------
        // Validate dependency
        // ------------------------------------------
        let normalizedDependencyId = null;

        if (
            dependencyId !== null &&
            dependencyId !== undefined
        ) {

            normalizedDependencyId =
                parseId(dependencyId);

            if (!normalizedDependencyId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "dependencyId must be a valid task id"
                });
            }

            if (
                !findTaskById(
                    normalizedDependencyId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Dependency task does not exist"
                });
            }
        }


        // ------------------------------------------
        // Cannot create Done task with incomplete
        // dependency
        // ------------------------------------------
        if (
            status === "Done" &&
            normalizedDependencyId !== null
        ) {

            const dependency =
                findTaskById(
                    normalizedDependencyId
                );

            if (dependency.status !== "Done") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Task cannot be created as Done because its dependency is not completed"
                });
            }
        }


        const now =
            new Date().toISOString();


        // ------------------------------------------
        // Create task
        // ------------------------------------------
        const newTask = {

            id: getNextTaskId(),

            title:
                title.trim(),

            description:
                typeof description === "string"
                    ? description.trim()
                    : "",

            priority,

            status,

            assignedTo:
                normalizedAssignedTo,

            dependencyId:
                normalizedDependencyId,

            createdAt:
                now,

            updatedAt:
                now
        };


        tasks.push(newTask);


        return res.status(201).json({

            success: true,

            message:
                "Task created successfully",

            task:
                formatTask(newTask)
        });

    } catch (error) {

        console.error(
            "Create task error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// GET ALL TASKS
// GET /api/tasks
// ==================================================
const getAllTasks = (req, res) => {

    try {

        const result =
            tasks.map(formatTask);

        return res.status(200).json({

            success: true,

            count:
                result.length,

            tasks:
                result
        });

    } catch (error) {

        console.error(
            "Get tasks error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// GET SINGLE TASK
// GET /api/tasks/:id
// ==================================================
const getTaskById = (req, res) => {

    try {

        const task =
            findTaskById(req.params.id);

        if (!task) {

            return res.status(404).json({

                success: false,

                message:
                    "Task not found"
            });
        }


        return res.status(200).json({

            success: true,

            task:
                formatTask(task)
        });

    } catch (error) {

        console.error(
            "Get task error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// GET TASKS FOR USER
// GET /api/tasks/user/:userId
// ==================================================
const getTasksForUser = (req, res) => {

    try {

        const userId =
            parseId(req.params.userId);


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user id"
            });
        }


        const user =
            findUserById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"
            });
        }


        const userTasks =
            tasks
                .filter(
                    task =>
                        task.assignedTo === userId
                )
                .map(formatTask);


        return res.status(200).json({

            success: true,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },

            count:
                userTasks.length,

            tasks:
                userTasks
        });

    } catch (error) {

        console.error(
            "Get user tasks error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// GET BLOCKED TASKS
// GET /api/tasks/blocked
// ==================================================
const getBlockedTasks = (req, res) => {

    try {

        const blockedTasks =
            tasks
                .filter(
                    task =>
                        getDependencyInfo(task).blocked
                )
                .map(formatTask);


        return res.status(200).json({

            success: true,

            count:
                blockedTasks.length,

            tasks:
                blockedTasks
        });

    } catch (error) {

        console.error(
            "Get blocked tasks error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// UPDATE TASK
// PUT /api/tasks/:id
// ==================================================
const updateTask = (req, res) => {

    try {

        const taskId =
            parseId(req.params.id);

        const task =
            findTaskById(taskId);


        if (!task) {

            return res.status(404).json({

                success: false,

                message:
                    "Task not found"
            });
        }


        const {
            title,
            description,
            priority,
            status,
            assignedTo,
            dependencyId
        } = req.body;


        // ------------------------------------------
        // Validate title
        // ------------------------------------------
        if (
            title !== undefined &&
            (
                typeof title !== "string" ||
                !title.trim()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Task title cannot be empty"
            });
        }


        // ------------------------------------------
        // Validate priority
        // ------------------------------------------
        if (
            priority !== undefined &&
            !ALLOWED_PRIORITIES.includes(priority)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Priority must be Low, Medium or High"
            });
        }


        // ------------------------------------------
        // Validate status
        // ------------------------------------------
        if (
            status !== undefined &&
            !ALLOWED_STATUSES.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be To Do, In Progress or Done"
            });
        }


        // ------------------------------------------
        // Validate assigned user
        // ------------------------------------------
        let normalizedAssignedTo =
            task.assignedTo;


        if (assignedTo !== undefined) {

            if (assignedTo === null) {

                normalizedAssignedTo =
                    null;

            } else {

                normalizedAssignedTo =
                    parseId(assignedTo);


                if (!normalizedAssignedTo) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "assignedTo must be a valid user id"
                    });
                }


                if (
                    !findUserById(
                        normalizedAssignedTo
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Assigned user does not exist"
                    });
                }
            }
        }


        // ------------------------------------------
        // Validate dependency
        // ------------------------------------------
        let normalizedDependencyId =
            task.dependencyId;


        if (dependencyId !== undefined) {

            if (dependencyId === null) {

                normalizedDependencyId =
                    null;

            } else {

                normalizedDependencyId =
                    parseId(dependencyId);


                if (!normalizedDependencyId) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "dependencyId must be a valid task id"
                    });
                }


                if (
                    normalizedDependencyId ===
                    taskId
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "A task cannot depend on itself"
                    });
                }


                if (
                    !findTaskById(
                        normalizedDependencyId
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Dependency task does not exist"
                    });
                }


                if (
                    hasCircularDependency(
                        taskId,
                        normalizedDependencyId
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Circular dependency is not allowed"
                    });
                }
            }
        }


        const finalStatus =
            status !== undefined
                ? status
                : task.status;


        // ------------------------------------------
        // Cannot mark Done if dependency incomplete
        // ------------------------------------------
        if (
            finalStatus === "Done" &&
            normalizedDependencyId !== null
        ) {

            const dependency =
                findTaskById(
                    normalizedDependencyId
                );


            if (
                !dependency ||
                dependency.status !== "Done"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Task cannot be marked Done because its dependency is not completed"
                });
            }
        }


        // ------------------------------------------
        // Update task
        // ------------------------------------------
        if (title !== undefined) {
            task.title = title.trim();
        }

        if (description !== undefined) {
            task.description =
                typeof description === "string"
                    ? description.trim()
                    : "";
        }

        if (priority !== undefined) {
            task.priority = priority;
        }

        if (status !== undefined) {
            task.status = status;
        }

        task.assignedTo =
            normalizedAssignedTo;

        task.dependencyId =
            normalizedDependencyId;

        task.updatedAt =
            new Date().toISOString();


        return res.status(200).json({

            success: true,

            message:
                "Task updated successfully",

            task:
                formatTask(task)
        });

    } catch (error) {

        console.error(
            "Update task error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// DELETE TASK
// DELETE /api/tasks/:id
// ==================================================
const deleteTask = (req, res) => {

    try {

        const taskId =
            parseId(req.params.id);


        const taskIndex =
            tasks.findIndex(
                task =>
                    task.id === taskId
            );


        if (taskIndex === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "Task not found"
            });
        }


        // Check whether another task depends on this
        const dependentTask =
            tasks.find(
                task =>
                    task.dependencyId === taskId
            );


        if (dependentTask) {

            return res.status(409).json({

                success: false,

                message:
                    `Cannot delete task because task #${dependentTask.id} depends on it`
            });
        }


        const deletedTask =
            tasks.splice(
                taskIndex,
                1
            )[0];


        return res.status(200).json({

            success: true,

            message:
                "Task deleted successfully",

            task:
                deletedTask
        });

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


// ==================================================
// COMPLETE TASK
// PATCH /api/tasks/:id/complete
// ==================================================
const completeTask = (req, res) => {

    try {

        const taskId =
            parseId(req.params.id);


        const task =
            findTaskById(taskId);


        if (!task) {

            return res.status(404).json({

                success: false,

                message:
                    "Task not found"
            });
        }


        if (task.status === "Done") {

            return res.status(400).json({

                success: false,

                message:
                    "Task is already completed"
            });
        }


        // Check dependency
        const dependencyInfo =
            getDependencyInfo(task);


        if (dependencyInfo.blocked) {

            return res.status(400).json({

                success: false,

                message:
                    dependencyInfo.message,

                blocked:
                    true,

                dependency:
                    dependencyInfo.dependency
                        ? {
                            id:
                                dependencyInfo.dependency.id,
                            title:
                                dependencyInfo.dependency.title,
                            status:
                                dependencyInfo.dependency.status
                        }
                        : null
            });
        }


        // Dependency is complete
        task.status =
            "Done";

        task.updatedAt =
            new Date().toISOString();


        return res.status(200).json({

            success: true,

            message:
                "Task marked as completed",

            task:
                formatTask(task)
        });

    } catch (error) {

        console.error(
            "Complete task error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"
        });
    }
};


module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    getTasksForUser,
    getBlockedTasks,
    updateTask,
    deleteTask,
    completeTask
};
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";

import {
    getTasks,
    getMyTasks,
    getBlockedTasks,
    deleteTask,
    completeTask,
} from "../../services/api";

// ==================================================
// TYPES
// ==================================================

interface User {
    id: number;
    name: string;
    email: string;
}

interface AssignedUser {
    id: number;
    name: string;
    email: string;
}

interface Dependency {
    id: number;
    title: string;
    status: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "To Do" | "In Progress" | "Done";
    assignedTo: number | null;
    dependencyId: number | null;
    assignedUser: AssignedUser | null;
    dependency: Dependency | null;
    blocked: boolean;
    createdAt?: string;
    updatedAt?: string;
}

type ViewType = "all" | "my" | "blocked";

type PriorityType =
    | "All"
    | "Low"
    | "Medium"
    | "High";

// ==================================================
// COMPONENT
// ==================================================

export default function TasksPage() {
    const router = useRouter();

    // Logged-in user
    const [user, setUser] = useState<User | null>(null);

    // All tasks currently displayed
    const [tasks, setTasks] = useState<Task[]>([]);

    // Current task view
    const [view, setView] = useState<ViewType>("all");

    // Priority filter
    const [priorityFilter, setPriorityFilter] =
        useState<PriorityType>("All");

    // Page loading
    const [loading, setLoading] = useState(true);

    // Loading state for Edit/Delete/Complete actions
    const [actionLoading, setActionLoading] =
        useState<number | null>(null);

    // Success/error message
    const [message, setMessage] = useState("");

    const [messageType, setMessageType] =
        useState<"success" | "error">("success");


    // ==================================================
    // CHECK LOGIN
    // ==================================================

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        // If there is no logged-in user,
        // redirect to the login page.
        if (!storedUser) {
            router.push("/login");
            return;
        }

        try {
            const loggedInUser: User =
                JSON.parse(storedUser);

            // Save logged-in user in state.
            setUser(loggedInUser);

            // Read the current view from URL.
            //
            // /tasks
            // /tasks?view=my
            // /tasks?view=blocked

            const params = new URLSearchParams(
                window.location.search
            );

            const urlView = params.get("view");

            let initialView: ViewType = "all";

            if (urlView === "my") {
                initialView = "my";
            } else if (urlView === "blocked") {
                initialView = "blocked";
            }

            // Save the selected view.
            setView(initialView);

        } catch (error) {
            console.error(
                "User parsing error:",
                error
            );

            localStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);


    // ==================================================
    // LOAD TASKS FROM BACKEND
    // ==================================================

    async function loadTasks(
        selectedView: ViewType,
        userId: number,
        showLoading: boolean = true
    ) {
        try {
            // Show loading screen only when needed.
            //
            // During automatic refresh we use false,
            // so the whole page does not flash "Loading".
            if (showLoading) {
                setLoading(true);
            }

            let result;

            // ------------------------------------------
            // ALL TASKS
            // ------------------------------------------

            if (selectedView === "all") {
                result = await getTasks();
            }

            // ------------------------------------------
            // MY TASKS
            // ------------------------------------------

            else if (selectedView === "my") {
                result = await getMyTasks(userId);
            }

            // ------------------------------------------
            // BLOCKED TASKS
            // ------------------------------------------

            else {
                result = await getBlockedTasks();
            }


            // ------------------------------------------
            // CHECK BACKEND RESPONSE
            // ------------------------------------------

            if (!result.success) {
                setMessageType("error");

                setMessage(
                    result.message ||
                    "Unable to load tasks."
                );

                setTasks([]);

                return;
            }


            // Save latest task data.
            setTasks(result.tasks || []);

        } catch (error) {
            console.error(
                "Load tasks error:",
                error
            );

            setMessageType("error");

            setMessage(
                "Unable to connect to backend."
            );

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }


    // ==================================================
    // INITIAL LOAD + AUTOMATIC REFRESH
    // ==================================================

    useEffect(() => {
        // Do nothing until we know the logged-in user.
        if (!user) {
            return;
        }

        // ------------------------------------------
        // FIRST LOAD
        // ------------------------------------------

        loadTasks(
            view,
            user.id,
            true
        );


        // ------------------------------------------
        // AUTOMATIC REFRESH
        // ------------------------------------------
        //
        // Every 5 seconds the frontend asks the
        // backend for the latest task information.
        //
        // Example:
        //
        // User A creates a task
        //        ↓
        // Backend stores the task
        //        ↓
        // User B's page checks backend
        //        ↓
        // New task appears automatically
        //
        // This is polling / near-real-time updating.

        const refreshInterval = setInterval(() => {
            loadTasks(
                view,
                user.id,
                false
            );
        }, 5000);


        // ------------------------------------------
        // CLEANUP
        // ------------------------------------------
        //
        // Stop the timer when leaving the page
        // or changing the task view.

        return () => {
            clearInterval(refreshInterval);
        };

    }, [user, view]);


    // ==================================================
    // CHANGE TASK VIEW
    // ==================================================

    function changeView(newView: ViewType) {
        if (!user) {
            return;
        }

        // Update the selected view.
        setView(newView);

        // Update browser URL.
        if (newView === "all") {
            router.push("/tasks");
        } else if (newView === "my") {
            router.push("/tasks?view=my");
        } else {
            router.push("/tasks?view=blocked");
        }

        // We do NOT call loadTasks here.
        // The useEffect above will automatically
        // load the new view when "view" changes.
    }


    // ==================================================
    // DELETE TASK
    // ==================================================

    async function handleDelete(taskId: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        setActionLoading(taskId);
        setMessage("");

        try {
            const result = await deleteTask(taskId);

            // Backend returned an error.
            if (!result.success) {
                setMessageType("error");

                setMessage(
                    result.message ||
                    "Unable to delete task."
                );

                return;
            }

            // Show success message.
            setMessageType("success");

            setMessage(
                "Task deleted successfully."
            );

            // Immediately refresh the task list.
            if (user) {
                await loadTasks(
                    view,
                    user.id,
                    false
                );
            }

        } catch (error) {
            console.error(
                "Delete task error:",
                error
            );

            setMessageType("error");

            setMessage(
                "Unable to connect to backend."
            );

        } finally {
            setActionLoading(null);
        }
    }


    // ==================================================
    // COMPLETE TASK
    // ==================================================

    async function handleComplete(taskId: number) {
        setActionLoading(taskId);
        setMessage("");

        try {
            const result = await completeTask(taskId);

            // Dependency rule failure or other error.
            if (!result.success) {
                setMessageType("error");

                setMessage(
                    result.message ||
                    "Task cannot be completed."
                );

                return;
            }

            // Show success message.
            setMessageType("success");

            setMessage(
                "Task completed successfully."
            );

            // Immediately refresh the task list.
            if (user) {
                await loadTasks(
                    view,
                    user.id,
                    false
                );
            }

        } catch (error) {
            console.error(
                "Complete task error:",
                error
            );

            setMessageType("error");

            setMessage(
                "Unable to connect to backend."
            );

        } finally {
            setActionLoading(null);
        }
    }


    // ==================================================
    // PRIORITY FILTER
    // ==================================================

    const filteredTasks =
        priorityFilter === "All"
            ? tasks
            : tasks.filter(
                (task) =>
                    task.priority === priorityFilter
            );


    // ==================================================
    // INITIAL LOADING SCREEN
    // ==================================================

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="text-center">

                    <p className="text-xl font-bold text-black">
                        Loading tasks...
                    </p>

                    <p className="text-gray-600 mt-2">
                        Please wait.
                    </p>

                </div>

            </main>
        );
    }


    // ==================================================
    // MAIN PAGE
    // ==================================================

    return (
        <main className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <Navbar />


            {/* Main content */}
            <section className="max-w-7xl mx-auto px-6 py-8">


                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <h2 className="text-3xl font-bold text-black">

                            {view === "all"
                                ? "All Tasks"
                                : view === "my"
                                    ? "My Tasks"
                                    : "Blocked Tasks"}

                        </h2>

                        <p className="text-gray-700 mt-2">

                            {view === "all"
                                ? "View and manage all tasks."
                                : view === "my"
                                    ? `Tasks assigned to ${user?.name}.`
                                    : "Tasks waiting for their dependencies."}

                        </p>

                    </div>


                    <Link
                        href="/tasks/create"
                        className="bg-black text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-800 text-center"
                    >
                        + Create Task
                    </Link>

                </div>


                {/* ======================================
                    TASK VIEW FILTER
                ====================================== */}

                <div className="bg-white rounded-2xl shadow p-5 mb-6">

                    <p className="font-bold text-black mb-3">
                        Task View
                    </p>

                    <div className="flex flex-wrap gap-3">

                        <button
                            onClick={() =>
                                changeView("all")
                            }
                            className={
                                view === "all"
                                    ? "bg-black text-white px-5 py-2 rounded-lg font-semibold"
                                    : "border border-gray-300 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
                            }
                        >
                            All Tasks
                        </button>


                        <button
                            onClick={() =>
                                changeView("my")
                            }
                            className={
                                view === "my"
                                    ? "bg-black text-white px-5 py-2 rounded-lg font-semibold"
                                    : "border border-gray-300 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
                            }
                        >
                            My Tasks
                        </button>


                        <button
                            onClick={() =>
                                changeView("blocked")
                            }
                            className={
                                view === "blocked"
                                    ? "bg-black text-white px-5 py-2 rounded-lg font-semibold"
                                    : "border border-gray-300 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
                            }
                        >
                            Blocked
                        </button>

                    </div>
                </div>


                {/* ======================================
                    PRIORITY FILTER
                ====================================== */}

                <div className="bg-white rounded-2xl shadow p-5 mb-6">

                    <p className="font-bold text-black mb-3">
                        Priority
                    </p>

                    <div className="flex flex-wrap gap-3">

                        {(
                            [
                                "All",
                                "Low",
                                "Medium",
                                "High",
                            ] as PriorityType[]
                        ).map((priority) => (

                            <button
                                key={priority}
                                onClick={() =>
                                    setPriorityFilter(
                                        priority
                                    )
                                }
                                className={
                                    priorityFilter === priority
                                        ? "bg-black text-white px-5 py-2 rounded-lg font-semibold"
                                        : "border border-gray-300 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
                                }
                            >
                                {priority}
                            </button>

                        ))}

                    </div>
                </div>


                {/* ======================================
                    MESSAGE
                ====================================== */}

                {message && (
                    <div
                        className={
                            messageType === "success"
                                ? "bg-green-100 text-green-800 border border-green-200 p-4 rounded-lg mb-6 font-medium"
                                : "bg-red-100 text-red-800 border border-red-200 p-4 rounded-lg mb-6 font-medium"
                        }
                    >
                        {message}
                    </div>
                )}


                {/* ======================================
                    TASK COUNT
                ====================================== */}

                <div className="mb-5">

                    <p className="text-gray-700">

                        Showing{" "}

                        <span className="font-bold text-black">
                            {filteredTasks.length}
                        </span>

                        {" "}
                        task
                        {filteredTasks.length !== 1
                            ? "s"
                            : ""}

                    </p>

                </div>


                {/* ======================================
                    NO TASKS
                ====================================== */}

                {filteredTasks.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow p-12 text-center">

                        <h3 className="text-2xl font-bold text-black">
                            No tasks found
                        </h3>

                        <p className="text-gray-600 mt-2">
                            There are no tasks in this view.
                        </p>

                        <Link
                            href="/tasks/create"
                            className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
                        >
                            Create Task
                        </Link>

                    </div>

                ) : (

                    /* ==================================
                       TASK CARDS
                    ================================== */

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {filteredTasks.map((task) => (

                            <div
                                key={task.id}
                                className="bg-white rounded-2xl shadow p-6"
                            >

                                {/* TITLE + PRIORITY */}

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <p className="text-xs text-gray-500">
                                            Task #{task.id}
                                        </p>

                                        <h3 className="text-xl font-bold text-black mt-1">
                                            {task.title}
                                        </h3>

                                    </div>


                                    <span
                                        className={
                                            task.priority === "High"
                                                ? "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold"
                                                : task.priority === "Medium"
                                                    ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold"
                                                    : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold"
                                        }
                                    >
                                        {task.priority}
                                    </span>

                                </div>


                                {/* DESCRIPTION */}

                                <p className="text-gray-700 mt-4">
                                    {task.description ||
                                        "No description provided."}
                                </p>


                                {/* STATUS */}

                                <div className="flex flex-wrap gap-2 mt-4">

                                    <span
                                        className={
                                            task.status === "Done"
                                                ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
                                                : task.status === "In Progress"
                                                    ? "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                                                    : "bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                                        }
                                    >
                                        {task.status}
                                    </span>


                                    {task.blocked && (
                                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                            BLOCKED
                                        </span>
                                    )}

                                </div>


                                {/* ASSIGNMENT / DEPENDENCY */}

                                <div className="mt-5 space-y-2 text-sm">

                                    <p className="text-gray-700">

                                        <span className="font-bold text-black">
                                            Assigned to:
                                        </span>

                                        {" "}

                                        {task.assignedUser
                                            ? task.assignedUser.name
                                            : "Unassigned"}

                                    </p>


                                    <p className="text-gray-700">

                                        <span className="font-bold text-black">
                                            Dependency:
                                        </span>

                                        {" "}

                                        {task.dependency
                                            ? `${task.dependency.title} (${task.dependency.status})`
                                            : "None"}

                                    </p>

                                </div>


                                {/* BLOCKED INFORMATION */}

                                {task.blocked &&
                                    task.dependency && (

                                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">

                                            <p className="text-orange-800 text-sm">

                                                This task is blocked until{" "}

                                                <strong>
                                                    {task.dependency.title}
                                                </strong>{" "}

                                                is completed.

                                            </p>

                                        </div>
                                    )}


                                {/* ACTION BUTTONS */}

                                <div className="flex flex-wrap gap-3 mt-6">

                                    {/* EDIT */}

                                    <Link
                                        href={`/tasks/edit/${task.id}`}
                                        className="border border-black text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
                                    >
                                        Edit
                                    </Link>


                                    {/* MARK DONE */}

                                    {task.status !== "Done" ? (

                                        <button
                                            onClick={() =>
                                                handleComplete(
                                                    task.id
                                                )
                                            }
                                            disabled={
                                                actionLoading === task.id
                                            }
                                            className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {actionLoading === task.id
                                                ? "Please wait..."
                                                : "Mark Done"}
                                        </button>

                                    ) : (

                                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold">
                                            Completed
                                        </span>

                                    )}


                                    {/* DELETE */}

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                task.id
                                            )
                                        }
                                        disabled={
                                            actionLoading === task.id
                                        }
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </section>

        </main>
    );
}
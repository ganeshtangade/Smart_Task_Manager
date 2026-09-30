"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../components/Navbar";

import {
    getUsers,
    getTasks,
    createTask,
} from "../../../services/api";


interface User {
    id: number;
    name: string;
    email: string;
}


interface Task {
    id: number;
    title: string;
    status: string;
}


export default function CreateTaskPage() {

    const router = useRouter();

    const [users, setUsers] =
        useState<User[]>([]);

    const [tasks, setTasks] =
        useState<Task[]>([]);


    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [priority, setPriority] =
        useState("Medium");

    const [status, setStatus] =
        useState("To Do");

    const [assignedTo, setAssignedTo] =
        useState("");

    const [dependencyId, setDependencyId] =
        useState("");


    const [loadingData, setLoadingData] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [success, setSuccess] =
        useState(false);


    // ==================================================
    // CHECK LOGIN + LOAD USERS/TASKS
    // ==================================================

    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {

            router.replace("/login");

            return;
        }

        loadFormData();

    }, [router]);


    // ==================================================
    // LOAD USERS AND TASKS
    // ==================================================

    async function loadFormData() {

        try {

            setLoadingData(true);
            setMessage("");

            const [
                usersResult,
                tasksResult,
            ] = await Promise.all([
                getUsers(),
                getTasks(),
            ]);


            if (!usersResult.success) {

                setMessage(
                    usersResult.message ||
                    "Unable to load users."
                );

                return;
            }


            if (!tasksResult.success) {

                setMessage(
                    tasksResult.message ||
                    "Unable to load tasks."
                );

                return;
            }


            setUsers(
                usersResult.users || []
            );

            setTasks(
                tasksResult.tasks || []
            );

        } catch (error) {

            console.error(
                "Load form data error:",
                error
            );

            setMessage(
                "Unable to connect to backend."
            );

        } finally {

            setLoadingData(false);
        }
    }


    // ==================================================
    // SUBMIT FORM
    // ==================================================

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setMessage("");
        setSuccess(false);
        setSaving(true);


        try {

            const result =
                await createTask({

                    title:
                        title.trim(),

                    description:
                        description.trim(),

                    priority,

                    status,

                    assignedTo:
                        assignedTo
                            ? Number(assignedTo)
                            : null,

                    dependencyId:
                        dependencyId
                            ? Number(dependencyId)
                            : null,

                });


            if (!result.success) {

                setMessage(
                    result.message ||
                    "Unable to create task."
                );

                return;
            }


            setSuccess(true);

            setMessage(
                "Task created successfully!"
            );


            // Clear form
            setTitle("");
            setDescription("");
            setPriority("Medium");
            setStatus("To Do");
            setAssignedTo("");
            setDependencyId("");


            // Go to tasks page
            setTimeout(() => {

                router.push("/tasks");

            }, 1000);


        } catch (error) {

            console.error(
                "Create task error:",
                error
            );

            setMessage(
                "Unable to connect to backend."
            );

        } finally {

            setSaving(false);
        }
    }


    // ==================================================
    // LOADING
    // ==================================================

    if (loadingData) {

        return (

            <main className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="min-h-[70vh] flex items-center justify-center">

                    <p className="text-black font-semibold">
                        Loading form...
                    </p>

                </div>

            </main>
        );
    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <main className="min-h-screen bg-gray-100">

            <Navbar />


            <section className="max-w-3xl mx-auto px-6 py-8">


                {/* HEADER */}

                <div className="mb-8">

                    <h2 className="text-3xl font-bold text-black">
                        Create New Task
                    </h2>

                    <p className="text-gray-700 mt-2">
                        Add a task and assign it to a user.
                    </p>

                </div>


                {/* FORM CARD */}

                <div className="bg-white rounded-2xl shadow-lg p-8">


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >


                        {/* TITLE */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter task title"
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                                required
                            />

                        </div>


                        {/* DESCRIPTION */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter task description"
                                rows={5}
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />

                        </div>


                        {/* PRIORITY */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={(event) =>
                                    setPriority(
                                        event.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white outline-none focus:border-black"
                            >

                                <option value="Low">
                                    Low
                                </option>

                                <option value="Medium">
                                    Medium
                                </option>

                                <option value="High">
                                    High
                                </option>

                            </select>

                        </div>


                        {/* STATUS */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white outline-none focus:border-black"
                            >

                                <option value="To Do">
                                    To Do
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Done">
                                    Done
                                </option>

                            </select>

                        </div>


                        {/* ASSIGNED USER */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Assign User
                            </label>

                            <select
                                value={assignedTo}
                                onChange={(event) =>
                                    setAssignedTo(
                                        event.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white outline-none focus:border-black"
                            >

                                <option value="">
                                    Unassigned
                                </option>

                                {users.map(
                                    (user) => (

                                        <option
                                            key={user.id}
                                            value={user.id}
                                        >
                                            {user.name}
                                            {" - "}
                                            {user.email}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* DEPENDENCY */}

                        <div>

                            <label className="block text-black font-semibold mb-2">
                                Dependency
                            </label>

                            <select
                                value={dependencyId}
                                onChange={(event) =>
                                    setDependencyId(
                                        event.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white outline-none focus:border-black"
                            >

                                <option value="">
                                    No Dependency
                                </option>

                                {tasks.map(
                                    (task) => (

                                        <option
                                            key={task.id}
                                            value={task.id}
                                        >
                                            #{task.id}
                                            {" - "}
                                            {task.title}
                                            {" ("}
                                            {task.status}
                                            {")"}
                                        </option>

                                    )
                                )}

                            </select>

                            <p className="text-gray-600 text-sm mt-2">
                                Select a task that must be completed first.
                            </p>

                        </div>


                        {/* MESSAGE */}

                        {message && (

                            <div
                                className={
                                    success
                                        ? "bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg font-medium"
                                        : "bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg font-medium"
                                }
                            >
                                {message}
                            </div>

                        )}


                        {/* BUTTONS */}

                        <div className="flex flex-wrap gap-3">

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Task"}
                            </button>


                            <Link
                                href="/tasks"
                                className="border border-black text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
                            >
                                Cancel
                            </Link>

                        </div>

                    </form>

                </div>

            </section>

        </main>
    );
}
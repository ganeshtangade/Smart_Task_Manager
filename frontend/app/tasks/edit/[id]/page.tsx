"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../../components/Navbar";

import {
    getTask,
    getUsers,
    getTasks,
    updateTask,
} from "../../../../services/api";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    assignedTo: number | null;
    dependencyId: number | null;
}

export default function EditTaskPage() {

    const router = useRouter();

    const params = useParams();

    const taskId =
        Number(params.id);

    const [users, setUsers] =
        useState<User[]>([]);

    const [tasks, setTasks] =
        useState<Task[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [priority, setPriority] =
        useState("Medium");

    const [status, setStatus] =
        useState("To Do");

    const [assignedTo, setAssignedTo] =
        useState<string>("");

    const [dependencyId, setDependencyId] =
        useState<string>("");

    const [message, setMessage] =
        useState("");

    const [success, setSuccess] =
        useState(false);


    useEffect(() => {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        loadData();

    }, [router]);


    async function loadData() {

        try {

            const [
                taskResult,
                usersResult,
                tasksResult,
            ] = await Promise.all([
                getTask(taskId),
                getUsers(),
                getTasks(),
            ]);

            if (!taskResult.success) {

                setMessage(
                    taskResult.message
                );

                return;
            }

            const task =
                taskResult.task;

            setTitle(
                task.title || ""
            );

            setDescription(
                task.description || ""
            );

            setPriority(
                task.priority || "Medium"
            );

            setStatus(
                task.status || "To Do"
            );

            setAssignedTo(
                task.assignedTo
                    ? String(task.assignedTo)
                    : ""
            );

            setDependencyId(
                task.dependencyId
                    ? String(task.dependencyId)
                    : ""
            );

            setUsers(
                usersResult.users || []
            );

            // Don't allow current task as dependency
            setTasks(
                (tasksResult.tasks || [])
                    .filter(
                        (item: Task) =>
                            item.id !== taskId
                    )
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to load task."
            );

        } finally {

            setLoading(false);
        }
    }


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setMessage("");
        setSuccess(false);
        setSaving(true);

        try {

            const result =
                await updateTask(
                    taskId,
                    {
                        title,
                        description,
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
                    }
                );


            if (!result.success) {

                setMessage(
                    result.message
                );

                return;
            }


            setSuccess(true);

            setMessage(
                "Task updated successfully."
            );


            setTimeout(() => {
                router.push("/tasks");
            }, 800);

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to connect to backend."
            );

        } finally {

            setSaving(false);
        }
    }


    if (loading) {

        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">

                <p className="text-black font-semibold">
                    Loading task...
                </p>

            </main>
        );
    }


    return (
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="max-w-3xl mx-auto px-6 py-8">

                <h2 className="text-3xl font-bold text-black mb-6">
                    Edit Task #{taskId}
                </h2>

                <div className="bg-white rounded-2xl shadow p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={e =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black"
                                required
                            />

                        </div>


                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={e =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg p-3 text-black"
                            />

                        </div>


                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Priority
                            </label>

                            <select
                                value={priority}
                                onChange={e =>
                                    setPriority(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white"
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


                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={e =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white"
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


                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Assign User
                            </label>

                            <select
                                value={assignedTo}
                                onChange={e =>
                                    setAssignedTo(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white"
                            >

                                <option value="">
                                    Unassigned
                                </option>

                                {users.map(user => (

                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name} - {user.email}
                                    </option>

                                ))}

                            </select>

                        </div>


                        <div>

                            <label className="block font-semibold text-black mb-2">
                                Dependency
                            </label>

                            <select
                                value={dependencyId}
                                onChange={e =>
                                    setDependencyId(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg p-3 text-black bg-white"
                            >

                                <option value="">
                                    No Dependency
                                </option>

                                {tasks.map(task => (

                                    <option
                                        key={task.id}
                                        value={task.id}
                                    >
                                        #{task.id} - {task.title}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {message && (

                            <div
                                className={
                                    success
                                        ? "bg-green-100 text-green-800 p-3 rounded-lg"
                                        : "bg-red-100 text-red-800 p-3 rounded-lg"
                                }
                            >
                                {message}
                            </div>

                        )}


                        <div className="flex flex-wrap gap-3">

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-black text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Update Task"}
                            </button>

                            <Link
                                href="/tasks"
                                className="border border-black text-black px-6 py-3 rounded-lg font-semibold"
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
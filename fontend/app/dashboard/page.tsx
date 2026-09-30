"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import {
    getTasks,
    getMyTasks,
    getBlockedTasks,
} from "../../services/api";

interface User {
    id: number;
    name: string;
    email: string;
}

interface Task {
    id: number;
    status: string;
}

export default function DashboardPage() {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    const [totalTasks, setTotalTasks] =
        useState(0);

    const [myTasks, setMyTasks] =
        useState(0);

    const [completedTasks, setCompletedTasks] =
        useState(0);

    const [blockedTasks, setBlockedTasks] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            router.push("/login");
            return;
        }

        try {
            const loggedInUser =
                JSON.parse(storedUser);

            setUser(loggedInUser);

            loadDashboard(
                loggedInUser.id
            );

        } catch {
            localStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    async function loadDashboard(
        userId: number
    ) {
        try {
            const [
                allResult,
                myResult,
                blockedResult,
            ] = await Promise.all([
                getTasks(),
                getMyTasks(userId),
                getBlockedTasks(),
            ]);

            const allTasks: Task[] =
                allResult.tasks || [];

            setTotalTasks(
                allTasks.length
            );

            setMyTasks(
                myResult.tasks?.length || 0
            );

            setBlockedTasks(
                blockedResult.tasks?.length || 0
            );

            setCompletedTasks(
                allTasks.filter(
                    task =>
                        task.status === "Done"
                ).length
            );

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-black font-semibold">
                    Loading dashboard...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="max-w-7xl mx-auto px-6 py-8">

                <h2 className="text-3xl font-bold text-black">
                    Welcome, {user?.name}
                </h2>

                <p className="text-gray-700 mt-2 mb-8">
                    Manage and track your tasks.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-gray-600">
                            Total Tasks
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {totalTasks}
                        </h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-gray-600">
                            My Tasks
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {myTasks}
                        </h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-gray-600">
                            Completed
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {completedTasks}
                        </h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow p-6">
                        <p className="text-gray-600">
                            Blocked
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {blockedTasks}
                        </h3>
                    </div>

                </div>

                <div className="bg-white rounded-2xl shadow p-6 mt-8">

                    <h3 className="text-xl font-bold text-black mb-4">
                        Quick Actions
                    </h3>

                    <div className="flex flex-wrap gap-4">

                        <Link
                            href="/tasks"
                            className="bg-black text-white px-5 py-3 rounded-lg font-semibold"
                        >
                            All Tasks
                        </Link>

                        <Link
                            href="/tasks?view=my"
                            className="border border-black text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            My Tasks
                        </Link>

                        <Link
                            href="/tasks?view=blocked"
                            className="border border-black text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            Blocked Tasks
                        </Link>

                        <Link
                            href="/tasks/create"
                            className="border border-black text-black px-5 py-3 rounded-lg font-semibold"
                        >
                            Create Task
                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
}
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

// ==================================================
// TYPES
// ==================================================

interface User {
    id: number;
    name: string;
    email: string;
}

interface Task {
    id: number;
    status: string;
}

// ==================================================
// COMPONENT
// ==================================================

export default function DashboardPage() {
    const router = useRouter();

    // Logged-in user
    const [user, setUser] =
        useState<User | null>(null);

    // Dashboard statistics
    const [totalTasks, setTotalTasks] =
        useState(0);

    const [myTasks, setMyTasks] =
        useState(0);

    const [completedTasks, setCompletedTasks] =
        useState(0);

    const [blockedTasks, setBlockedTasks] =
        useState(0);

    // Initial page loading
    const [loading, setLoading] =
        useState(true);


    // ==================================================
    // CHECK LOGIN
    // ==================================================

    useEffect(() => {
        const storedUser =
            localStorage.getItem("user");

        // If user is not logged in,
        // redirect to login page.
        if (!storedUser) {
            router.push("/login");
            return;
        }

        try {
            const loggedInUser: User =
                JSON.parse(storedUser);

            // Save user.
            setUser(loggedInUser);

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
    // LOAD DASHBOARD DATA
    // ==================================================

    async function loadDashboard(
        userId: number,
        showLoading: boolean = true
    ) {
        try {
            // Show loading screen only during
            // the initial dashboard load.
            //
            // Automatic refresh uses false.
            if (showLoading) {
                setLoading(true);
            }

            // Request all required dashboard data
            // at the same time.
            const [
                allResult,
                myResult,
                blockedResult,
            ] = await Promise.all([
                getTasks(),
                getMyTasks(userId),
                getBlockedTasks(),
            ]);


            // ------------------------------------------
            // ALL TASKS
            // ------------------------------------------

            const allTasks: Task[] =
                allResult.tasks || [];


            // ------------------------------------------
            // TOTAL TASKS
            // ------------------------------------------

            setTotalTasks(
                allTasks.length
            );


            // ------------------------------------------
            // MY TASKS
            // ------------------------------------------

            setMyTasks(
                myResult.tasks?.length || 0
            );


            // ------------------------------------------
            // BLOCKED TASKS
            // ------------------------------------------

            setBlockedTasks(
                blockedResult.tasks?.length || 0
            );


            // ------------------------------------------
            // COMPLETED TASKS
            // ------------------------------------------

            setCompletedTasks(
                allTasks.filter(
                    (task) =>
                        task.status === "Done"
                ).length
            );

        } catch (error) {
            console.error(
                "Dashboard loading error:",
                error
            );

        } finally {

            // Only stop the loading screen
            // when this was an initial load.
            if (showLoading) {
                setLoading(false);
            }
        }
    }


    // ==================================================
    // INITIAL LOAD + AUTOMATIC REFRESH
    // ==================================================

    useEffect(() => {

        // Wait until logged-in user is available.
        if (!user) {
            return;
        }


        // ------------------------------------------
        // FIRST DASHBOARD LOAD
        // ------------------------------------------

        loadDashboard(
            user.id,
            true
        );


        // ------------------------------------------
        // AUTOMATIC REFRESH
        // ------------------------------------------
        //
        // Every 5 seconds the dashboard gets
        // the latest task information.
        //
        // Therefore these cards can update automatically:
        //
        // Total Tasks
        // My Tasks
        // Completed
        // Blocked

        const refreshInterval =
            setInterval(() => {

                loadDashboard(
                    user.id,
                    false
                );

            }, 5000);


        // ------------------------------------------
        // CLEANUP
        // ------------------------------------------
        //
        // Stop the interval when leaving
        // the dashboard page.

        return () => {
            clearInterval(refreshInterval);
        };

    }, [user]);


    // ==================================================
    // LOADING SCREEN
    // ==================================================

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">

                <p className="text-black font-semibold">
                    Loading dashboard...
                </p>

            </main>
        );
    }


    // ==================================================
    // MAIN DASHBOARD
    // ==================================================

    return (
        <main className="min-h-screen bg-gray-100">

            {/* Navbar */}
            <Navbar />


            <section className="max-w-7xl mx-auto px-6 py-8">

                {/* ======================================
                    WELCOME
                ====================================== */}

                <h2 className="text-3xl font-bold text-black">
                    Welcome, {user?.name}
                </h2>

                <p className="text-gray-700 mt-2 mb-8">
                    Manage and track your tasks.
                </p>


                {/* ======================================
                    DASHBOARD STATISTICS
                ====================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* TOTAL TASKS */}

                    <div className="bg-white rounded-2xl shadow p-6">

                        <p className="text-gray-600">
                            Total Tasks
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {totalTasks}
                        </h3>

                    </div>


                    {/* MY TASKS */}

                    <div className="bg-white rounded-2xl shadow p-6">

                        <p className="text-gray-600">
                            My Tasks
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {myTasks}
                        </h3>

                    </div>


                    {/* COMPLETED */}

                    <div className="bg-white rounded-2xl shadow p-6">

                        <p className="text-gray-600">
                            Completed
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {completedTasks}
                        </h3>

                    </div>


                    {/* BLOCKED */}

                    <div className="bg-white rounded-2xl shadow p-6">

                        <p className="text-gray-600">
                            Blocked
                        </p>

                        <h3 className="text-3xl font-bold text-black mt-2">
                            {blockedTasks}
                        </h3>

                    </div>

                </div>


                {/* ======================================
                    QUICK ACTIONS
                ====================================== */}

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
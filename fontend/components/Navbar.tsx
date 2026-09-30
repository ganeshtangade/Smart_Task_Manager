"use client";

export default function Navbar() {
    function handleLogout() {
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    return (
        <nav className="bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">

                    <a
                        href="/dashboard"
                        className="text-xl font-bold"
                    >
                        Smart Task Manager
                    </a>

                    <div className="flex flex-wrap items-center gap-4">

                        <a
                            href="/dashboard"
                            className="hover:underline"
                        >
                            Dashboard
                        </a>

                        <a
                            href="/tasks"
                            className="hover:underline"
                        >
                            All Tasks
                        </a>

                        <a
                            href="/tasks?view=my"
                            className="hover:underline"
                        >
                            My Tasks
                        </a>

                        <a
                            href="/tasks?view=blocked"
                            className="hover:underline"
                        >
                            Blocked
                        </a>

                        <a
                            href="/users"
                            className="hover:underline"
                        >
                            Users
                        </a>

                        <a
                            href="/tasks/create"
                            className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200"
                        >
                            Create Task
                        </a>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="border border-white px-5 py-2 rounded-lg font-semibold hover:bg-white hover:text-black"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </div>
        </nav>
    );
}
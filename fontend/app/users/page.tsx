"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import { getUsers } from "../../services/api";

interface User {
    id: number;
    name: string;
    email: string;
}

export default function UsersPage() {

    const router = useRouter();

    const [users, setUsers] =
        useState<User[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");

    useEffect(() => {

        const user =
            localStorage.getItem("user");

        if (!user) {
            router.push("/login");
            return;
        }

        loadUsers();

    }, [router]);


    async function loadUsers() {

        try {

            const result =
                await getUsers();

            if (!result.success) {

                setMessage(
                    result.message
                );

                return;
            }

            setUsers(
                result.users || []
            );

        } catch (error) {

            console.error(error);

            setMessage(
                "Unable to load users."
            );

        } finally {

            setLoading(false);
        }
    }


    if (loading) {

        return (
            <main className="min-h-screen bg-gray-100 flex items-center justify-center">

                <p className="text-black font-semibold">
                    Loading users...
                </p>

            </main>
        );
    }


    return (
        <main className="min-h-screen bg-gray-100">

            <Navbar />

            <section className="max-w-5xl mx-auto px-6 py-8">

                <h2 className="text-3xl font-bold text-black">
                    Users
                </h2>

                <p className="text-gray-700 mt-2 mb-8">
                    All registered users.
                </p>

                {message && (

                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {message}
                    </div>

                )}


                {users.length === 0 ? (

                    <div className="bg-white rounded-2xl shadow p-10 text-center">

                        <h3 className="text-xl font-bold text-black">
                            No users found
                        </h3>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {users.map(user => (

                            <div
                                key={user.id}
                                className="bg-white rounded-2xl shadow p-6"
                            >

                                <p className="text-xs text-gray-500">
                                    User #{user.id}
                                </p>

                                <h3 className="text-xl font-bold text-black mt-1">
                                    {user.name}
                                </h3>

                                <p className="text-gray-700 mt-2">
                                    {user.email}
                                </p>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </main>
    );
}
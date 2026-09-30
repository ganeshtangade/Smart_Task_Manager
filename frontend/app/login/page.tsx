"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { loginUser } from "../../services/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const result = await loginUser({
                email,
                password,
            });

            if (!result.success) {
                setMessage(result.message);
                return;
            }

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            router.push("/dashboard");

        } catch (error) {
            console.error(error);

            setMessage(
                "Unable to connect to backend."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-black">
                        Smart Task Manager
                    </h1>

                    <p className="text-black mt-2">
                        Login to your account
                    </p>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="space-y-5"
                >

                    <div>
                        <label className="block font-semibold mb-2 text-black">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-black font-medium placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-2 text-black">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg p-3 text-black font-medium placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                            required
                        />
                    </div>

                    {message && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-medium">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>
                </form>

                <p className="text-center text-black mt-6">
                    Don't have an account?{" "}

                    <Link
                        href="/register"
                        className="font-bold text-black hover:underline"
                    >
                        Create Account
                    </Link>
                </p>

            </div>
        </main>
    );
}
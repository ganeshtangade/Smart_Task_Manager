"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUser } from "../../services/api";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setSuccess(false);
        setLoading(true);

        try {
            const result = await createUser({
                name: name.trim(),
                email: email.trim(),
                password,
            });

            if (!result.success) {
                setMessage(
                    result.message || "Registration failed."
                );
                return;
            }

            setSuccess(true);
            setMessage(
                "Account created successfully!"
            );

            setName("");
            setEmail("");
            setPassword("");

            setTimeout(() => {
                router.push("/login");
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);

            setMessage(
                "Unable to connect to backend."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-black">
                        Create Account
                    </h1>

                    <p className="text-black mt-2">
                        Join Smart Task Manager
                    </p>
                </div>

                <form
                    onSubmit={handleRegister}
                    className="space-y-5"
                >

                    {/* Name */}
                    <div>
                        <label className="block text-black font-semibold mb-2">
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            placeholder="Enter your name"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-black font-semibold mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-black font-semibold mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="Create a password"
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-500 outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* Message */}
                    {message && (
                        <div
                            className={
                                success
                                    ? "rounded-lg bg-green-100 border border-green-300 p-3 text-sm font-medium text-green-800"
                                    : "rounded-lg bg-red-100 border border-red-300 p-3 text-sm font-medium text-red-800"
                            }
                        >
                            {message}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black py-3 text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="mt-6 text-center text-black">
                    Already have an account?{" "}

                    <Link
                        href="/login"
                        className="font-bold text-black hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </main>
    );
}
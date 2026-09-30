"use client";

import { useRouter } from "next/navigation";

export default function TestPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">
            <h1 className="text-3xl font-bold text-black">
                Test Page
            </h1>

            <button
                onClick={() => router.push("/dashboard")}
                className="bg-black text-white px-6 py-3 rounded-lg"
            >
                Go to Dashboard
            </button>
        </div>
    );
}
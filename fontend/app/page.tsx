"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const user = localStorage.getItem("user");

        if (user) {
            router.replace("/dashboard");
        } else {
            router.replace("/login");
        }
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-black font-semibold">
                Loading...
            </p>
        </main>
    );
}
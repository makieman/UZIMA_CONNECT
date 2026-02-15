"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { clearAuthState } from "@/lib/storage";

export default function PhysicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <main>
                {children}
            </main>
        </div>
    );
}

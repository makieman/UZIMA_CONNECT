"use client";

import NotificationBell from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useEffect, useState } from "react";
import { getAuthState, clearAuthState } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const state = getAuthState();
        if (state?.user) {
            setUser(state.user);
        }
    }, []);

    const handleLogout = () => {
        clearAuthState();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {children}
        </div>
    );
}

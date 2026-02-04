"use client";

import { useEffect, useState } from "react";
import AdminDashboard from "@/components/admin/dashboard";
import { getAuthState } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
    const [auth, setAuth] = useState<{ user: any, token: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const state = getAuthState();
        if (state && state.user.role === "admin") {
            setAuth(state);
        } else {
            router.push("/");
        }
    }, [router]);

    if (!auth) return <div className="p-8 text-center">Loading dashboard...</div>;

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    };

    return <AdminDashboard user={auth.user} token={auth.token} onLogout={handleLogout} />;
}

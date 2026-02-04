"use client";

import { useEffect, useState } from "react";
import PhysicianDashboard from "@/components/physician/dashboard";
import { getAuthState } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function PhysicianDashboardPage() {
    const [auth, setAuth] = useState<{ user: any, token: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const state = getAuthState();
        if (state && state.user.role === "physician") {
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

    return <PhysicianDashboard user={auth.user} token={auth.token} onLogout={handleLogout} />;
}

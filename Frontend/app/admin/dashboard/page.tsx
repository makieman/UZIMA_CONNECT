"use client";

import { useEffect, useRef } from "react";
import AdminDashboard from "@/components/admin/dashboard";
import { clearAuthState, getAuthState } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

export default function AdminDashboardPage() {
    const router = useRouter();
    const { signOut } = useAuthActions();
    const convexUser = useQuery(api.auth.loggedInUser);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
    }, []);

    useEffect(() => {
        // No local auth state at all → redirect immediately
        const localAuth = getAuthState();
        if (!localAuth?.user) {
            router.replace("/login");
            return;
        }

        // Convex query still in-flight → keep waiting
        if (convexUser === undefined) return;

        // User resolved and has the correct role → authorised, clear any pending redirect
        if (convexUser && (convexUser.role === "super_admin" || convexUser.role === "facility_admin")) {
            if (redirectTimer.current) { clearTimeout(redirectTimer.current); redirectTimer.current = null; }
            return;
        }

        // convexUser is null or wrong role.  This can happen briefly while the auth
        // token propagates after a fresh signIn.  Wait 3 s before giving up.
        if (!redirectTimer.current) {
            redirectTimer.current = setTimeout(() => {
                clearAuthState();
                router.replace("/login");
            }, 3000);
        }
    }, [convexUser, router]);

    // Show spinner while user hasn’t been confirmed as an admin yet
    if (!convexUser || (convexUser.role !== "super_admin" && convexUser.role !== "facility_admin")) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Wrong role or not authenticated — redirecting via effect
    if (!convexUser || (convexUser.role !== "super_admin" && convexUser.role !== "facility_admin")) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-slate-500 text-sm">Redirecting...</p>
            </div>
        );
    }

    const user = {
        id: convexUser._id,
        role: convexUser.role,
        fullName: convexUser.fullName,
        email: convexUser.email,
        hospitalId: (convexUser as any).hospitalId,
    };

    const handleLogout = async () => {
        await signOut();
        clearAuthState();
        router.replace("/");
    };

    return <AdminDashboard user={user} token="convex-managed-session" onLogout={handleLogout} />;
}

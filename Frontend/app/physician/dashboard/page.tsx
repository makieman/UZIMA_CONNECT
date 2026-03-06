"use client";

import { useEffect, useRef } from "react";
import PhysicianDashboard from "@/components/physician/dashboard";
import { clearAuthState, getAuthState } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

export default function PhysicianDashboardPage() {
    const router = useRouter();
    const { signOut } = useAuthActions();
    const convexUser = useQuery(api.auth.loggedInUser);
    const physician = useQuery(
        api.physicians.getPhysicianByUser,
        convexUser ? { userId: convexUser._id } : "skip"
    );
    const clearInitialPassword = useMutation(api.physicians.clearInitialPassword);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
    }, []);

    // Clear initial password on first login, after physician profile is loaded.
    useEffect(() => {
        if (physician && physician.initialPassword) {
            clearInitialPassword({ physicianId: physician._id }).catch(() => {});
        }
    }, [physician, clearInitialPassword]);

    useEffect(() => {
        // No local auth state at all → redirect immediately
        const localAuth = getAuthState();
        if (!localAuth?.user) {
            router.replace("/login");
            return;
        }

        // Convex query still in-flight → keep waiting
        if (convexUser === undefined) return;

        // User resolved and has correct role → authorised
        if (convexUser && convexUser.role === "physician") {
            if (redirectTimer.current) { clearTimeout(redirectTimer.current); redirectTimer.current = null; }
            return;
        }

        // convexUser is null or wrong role — could be brief race after signIn.
        // Wait 3 s before giving up.
        if (!redirectTimer.current) {
            redirectTimer.current = setTimeout(() => {
                clearAuthState();
                router.replace("/login");
            }, 3000);
        }
    }, [convexUser, router]);

    // Show spinner while user or physician profile hasn't been confirmed
    if (!convexUser || convexUser.role !== "physician" || physician === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Loading physician profile...</p>
                </div>
            </div>
        );
    }

    // Wrong role or not authenticated — redirecting via effect
    if (!convexUser || convexUser.role !== "physician") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <p className="text-slate-500 text-sm">Redirecting...</p>
            </div>
        );
    }

    const user = {
        id: physician ? physician._id : convexUser._id,
        userId: convexUser._id,
        role: convexUser.role,
        fullName: convexUser.fullName,
        email: convexUser.email,
        hospitalId: (convexUser as any).hospitalId || (physician as any)?.hospitalId,
    };

    const handleLogout = async () => {
        await signOut();
        clearAuthState();
        router.replace("/");
    };

    return <PhysicianDashboard user={user} token="convex-managed-session" onLogout={handleLogout} />;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleSelector from "../../components/auth/role-selector";
import PhysicianLogin from "../../components/auth/physician-login";
import AdminLogin from "../../components/auth/admin-login";
import type { UserRole } from "../../lib/types";
import { getAuthState } from "../../lib/storage";

type AppState = "role-select" | "login";

export default function LoginPage() {
    const router = useRouter();
    const [appState, setAppState] = useState<AppState>("role-select");
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = getAuthState();
        if (auth && auth.user) {
            if (auth.user.role === "admin") {
                router.push("/admin/dashboard");
                return;
            } else if (auth.user.role === "physician") {
                router.push("/physician/dashboard");
                return;
            }
        }
        // No auth or role not handled
        setIsLoading(false);
    }, [router]);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setAppState("login");
    };

    const handleLoginSuccess = (userData: any, authToken: string) => {
        if (selectedRole === "admin") {
            router.push("/admin/dashboard");
        } else {
            router.push("/physician/dashboard");
        }
    };

    const handleBack = () => {
        setAppState("role-select");
        setSelectedRole(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-primary font-medium animate-pulse">
                        Checking session...
                    </p>
                </div>
            </div>
        );
    }

    if (appState === "role-select") {
        return <RoleSelector onSelectRole={handleRoleSelect} />;
    }

    if (appState === "login") {
        return (
            <div className="min-h-screen relative bg-gray-50">
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={handleBack}
                        className="text-gray-600 hover:text-primary transition-colors flex items-center gap-2 font-medium bg-white/90 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm border border-gray-200"
                    >
                        <span className="text-lg">←</span> Back to Roles
                    </button>
                </div>
                {selectedRole === "physician" && (
                    <PhysicianLogin onLoginSuccess={handleLoginSuccess} />
                )}
                {selectedRole === "admin" && (
                    <AdminLogin onLoginSuccess={handleLoginSuccess} />
                )}
            </div>
        );
    }

    return null;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhysicianLogin from "../../components/auth/physician-login";
import AdminLogin from "../../components/auth/admin-login";
import { getAuthState, setAuthState, clearAuthState } from "../../lib/storage";
import { Stethoscope, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signOut } = useAuthActions();
    const convex = useConvex();
    const [isLoading, setIsLoading] = useState(false);

    // Debug: verify this code version is rendering
    console.log("[LoginPage] render — isLoading =", isLoading);

    // On mount: if localStorage already has auth state, redirect immediately
    useEffect(() => {
        const auth = getAuthState();
        if (auth && auth.user) {
            if (auth.user.role === "facility_admin" || auth.user.role === "super_admin") {
                router.replace("/admin/dashboard");
            } else if (auth.user.role === "physician") {
                router.replace("/physician/dashboard");
            }
        }
    }, [router]);

    // After signIn succeeds, poll the server until the authenticated user
    // record is available (waits for JWT propagation across the WebSocket).
    const waitForUserAndRedirect = useCallback(async () => {
        console.log("[AUTH] Starting poll for user record...");
        for (let attempt = 0; attempt < 20; attempt++) {
            await new Promise(r => setTimeout(r, 500));
            try {
                const user = await convex.query(api.auth.loggedInUser);
                console.log(`[AUTH] Poll attempt ${attempt + 1}: user =`, user);
                if (user && user.role) {
                    setAuthState("convex-session", {
                        id: user._id,
                        role: user.role,
                        fullName: user.fullName,
                        email: user.email,
                    });
                    console.log(`[AUTH] Redirecting to dashboard for role: ${user.role}`);
                    if (user.role === "facility_admin" || user.role === "super_admin") {
                        router.replace("/admin/dashboard");
                    } else if (user.role === "physician") {
                        router.replace("/physician/dashboard");
                    } else {
                        // Fallback for unexpected roles (e.g. patient) — go to login with message
                        console.warn(`[AUTH] Unexpected role "${user.role}" — no dashboard available`);
                        setIsLoading(false);
                        alert(`Logged in as "${user.role}" but no dashboard exists for this role.`);
                    }
                    return;
                }
            } catch (_e) {
                console.log(`[AUTH] Poll attempt ${attempt + 1}: error`, _e);
            }
        }
        // Timed out after ~10 seconds
        console.error("[AUTH] Polling timed out — no user found after 20 attempts");
        clearAuthState();
        setIsLoading(false);
        alert("Login succeeded but could not verify your account. Please try again.");
    }, [convex, router]);

    // Called by AdminLogin / PhysicianLogin after signIn succeeds.
    const handleLoginSuccess = useCallback(() => {
        setIsLoading(true);
        waitForUserAndRedirect();
    }, [waitForUserAndRedirect]);

    const handleDemoLogin = async (email: string, _expectedRole: string) => {
        console.log(`[AUTH] handleDemoLogin called: email=${email}`);
        setIsLoading(true);
        try {
            console.log("[AUTH] Calling signOut...");
            try { await signOut(); } catch (_e) { console.log("[AUTH] signOut error (ignored)", _e); }
            console.log("[AUTH] signOut complete");

            let authenticated = false;

            // Try signUp first
            console.log("[AUTH] Trying signUp...");
            try {
                await signIn("password", { email, password: "demo1234", flow: "signUp" });
                authenticated = true;
                console.log("[AUTH] signUp resolved successfully");
            } catch (e) {
                console.log("[AUTH] signUp threw:", e);
            }

            if (!authenticated) {
                console.log("[AUTH] Trying signIn...");
                try {
                    await signIn("password", { email, password: "demo1234", flow: "signIn" });
                    authenticated = true;
                    console.log("[AUTH] signIn resolved successfully");
                } catch (e) {
                    console.log("[AUTH] signIn threw:", e);
                }
            }

            if (!authenticated) {
                console.log("[AUTH] Both methods failed, checking if session exists anyway...");
                await new Promise(r => setTimeout(r, 500));
                try {
                    const check = await convex.query(api.auth.loggedInUser);
                    console.log("[AUTH] Session check result:", check);
                    if (check) authenticated = true;
                } catch (_e) { console.log("[AUTH] Session check error:", _e); }
            }

            console.log("[AUTH] authenticated =", authenticated);
            if (!authenticated) {
                throw new Error("Could not authenticate. Try resetting demo accounts.");
            }

            // Poll until the user record is available then redirect
            await waitForUserAndRedirect();
        } catch (e) {
            console.error("[AUTH] Demo login failed", e);
            alert("Demo login failed: " + (e instanceof Error ? e.message : String(e)));
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-primary font-medium animate-pulse">
                        Authenticating Environment...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white relative">

            {/* Left Pane: Branding / Imagery */}
            <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-gray-900 relative items-center justify-center overflow-hidden">
                {/* Background styling for professional medical aesthetic */}
                <div className="absolute inset-0 bg-blue-900/20 z-10 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-black z-0" />

                {/* Abstract medical shapes */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

                <div className="relative z-20 p-12 text-white max-w-lg">
                    <Image
                        src="/logo/logo.png"
                        alt="UzimaCare Logo"
                        width={280}
                        height={100}
                        className="h-auto w-48 mb-12 brightness-0 invert"
                        priority
                    />
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                        Seamless <span className="text-blue-400">referrals.</span><br />
                        Better <span className="text-orange-400">outcomes.</span>
                    </h1>
                    <p className="text-gray-300 text-lg leading-relaxed mb-8">
                        The unified intelligent platform connecting physicians, specialists, and facility administrators across the healthcare network to guarantee the best patient care.
                    </p>

                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mt-12">
                        <div className="bg-green-500/20 p-3 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Secure Platform</p>
                            <p className="text-xs text-gray-400">End-to-end HIPAA compliant encryption</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Pane: Login Authentication */}
            <div className="w-full md:w-1/2 lg:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-gray-50/50">
                <div className="w-full max-w-md">

                    {/* Mobile Logo Only */}
                    <div className="md:hidden flex justify-center mb-8">
                        <Image
                            src="/logo/logo.png"
                            alt="UzimaCare Logo"
                            width={240}
                            height={80}
                            className="h-16 w-auto"
                            priority
                        />
                    </div>

                    <div className="mb-8 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Please enter your credentials to access your portal.</p>
                    </div>

                    <Tabs defaultValue="physician" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100/80 p-1 rounded-xl">
                            <TabsTrigger
                                value="physician"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium transition-all"
                            >
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Physician
                            </TabsTrigger>
                            <TabsTrigger
                                value="admin"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium transition-all"
                            >
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Administration
                            </TabsTrigger>
                        </TabsList>

                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <TabsContent value="physician" className="m-0 border-none p-0 outline-none">
                                <PhysicianLogin onLoginSuccess={handleLoginSuccess} />
                            </TabsContent>

                            <TabsContent value="admin" className="m-0 border-none p-0 outline-none">
                                <AdminLogin onLoginSuccess={handleLoginSuccess} />
                            </TabsContent>
                        </div>
                    </Tabs>

                    <p className="text-center text-sm text-gray-400 mt-8">
                        &copy; {new Date().getFullYear()} UzimaCare Technologies. All rights reserved.
                    </p>
                </div>
            </div>

        </div>
    );
}

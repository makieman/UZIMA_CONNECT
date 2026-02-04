"use client";

import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { clearAuthState } from "@/lib/storage";

export default function PhysicianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const user = { id: "physician-001", fullName: "Dr. James Kipchoge", hospital: "Nairobi Central Hospital" };

    const handleLogout = () => {
        clearAuthState();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-surface">
            <header className="bg-primary text-white py-3 px-6 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex items-center">
                                <span className="text-black" style={{ WebkitTextStroke: '1px white' }}>UZ</span>
                                <span className="text-white" style={{ WebkitTextStroke: '1px white' }}>I</span>
                                <span className="text-red-600" style={{ WebkitTextStroke: '1px white' }}>MA</span>
                                <span className="text-white" style={{ WebkitTextStroke: '1px white' }}>C</span>
                                <span className="text-green-600" style={{ WebkitTextStroke: '1px white' }}>A</span>
                                <span className="text-green-600" style={{ WebkitTextStroke: '1px white' }}>RE</span>
                            </span>
                        </h1>
                        <span className="h-6 w-px bg-white/20"></span>
                        <div>
                            <p className="text-sm font-semibold">{user.fullName}</p>
                            <p className="text-xs text-white/80">{user.hospital}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10 hover:text-white"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
}

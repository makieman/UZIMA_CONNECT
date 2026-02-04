"use client";

import NotificationBell from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { clearAuthState } from "@/lib/storage";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const user = { id: "admin-1", fullName: "Admin User", hospital: "Main Referral Center" };

    const handleLogout = () => {
        clearAuthState();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-surface">
            <header className="bg-primary text-white py-3 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="flex items-center">
                                <span className="text-black" style={{ WebkitTextStroke: '1px white' }}>UZ</span>
                                <span className="text-white" style={{ WebkitTextStroke: '1px white' }}>I</span>
                                <span className="text-red-600" style={{ WebkitTextStroke: '1px white' }}>MA</span>
                                <span className="text-white" style={{ WebkitTextStroke: '1px white' }}>C</span>
                                <span className="text-green-600" style={{ WebkitTextStroke: '1px white' }}>A</span>
                                <span className="text-green-600" style={{ WebkitTextStroke: '1px white' }}>RE</span>
                            </span>
                            <span className="text-sm font-normal opacity-90 border-l border-white/30 pl-2 ml-2">Administration Portal</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell userId={user.id} />
                        <Button
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
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

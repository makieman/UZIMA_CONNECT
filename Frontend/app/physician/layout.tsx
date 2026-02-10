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
    const router = useRouter();
    const user = { id: "physician-001", fullName: "Dr. James Kipchoge", hospital: "Nairobi Central Hospital" };

    const handleLogout = () => {
        clearAuthState();
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-surface">
            <header className="bg-primary text-white py-3 px-4 sm:px-6 sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto overflow-hidden">
                        <h1 className="flex-shrink-0">
                            <Image
                                src="/logo/logo.png"
                                alt="UzimaCare Logo"
                                width={180}
                                height={50}
                                className="h-10 sm:h-12 w-auto object-contain"
                            />
                        </h1>
                        <span className="hidden sm:block h-6 w-px bg-white/20"></span>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-semibold truncate">{user.fullName}</p>
                            <p className="text-xs text-white/80 truncate hidden sm:block">{user.hospital}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-white/10 pt-2 sm:pt-0 sm:border-0 mt-1 sm:mt-0">
                        <p className="text-xs text-white/80 truncate sm:hidden">{user.hospital}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 hover:text-white h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
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

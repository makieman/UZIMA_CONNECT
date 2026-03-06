import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const AdminDashboardClient = nextDynamic(() => import("./AdminDashboardClient"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Loading dashboard...</p>
            </div>
        </div>
    ),
});

export default function AdminDashboardPage() {
    return <AdminDashboardClient />;
}

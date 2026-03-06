import nextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const LoginClient = nextDynamic(() => import("./LoginClient"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-primary font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    ),
});

export default function LoginPage() {
    return <LoginClient />;
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                U
              </div>
              <span className="font-bold text-2xl tracking-tight text-gray-900">
                Uzima<span className="text-primary">Care</span>
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              404
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button className="h-12 px-8 text-base bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="h-12 px-8 text-base border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition-all"
              >
                Login Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
            <span className="font-bold text-lg text-gray-900">UzimaCare</span>
          </div>
          <p className="text-gray-500 text-xs">
            © 2024 UzimaCare. Built for Kenya.
          </p>
        </div>
      </footer>
    </div>
  );
}

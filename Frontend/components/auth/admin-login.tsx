"use client";

import type React from "react";

import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { saveAuthState } from "../../lib/storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("admin@uzimacare.ke");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const convex = useConvex();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await convex.query(api.users.getUserByEmail, { email });

      if (user && user.role === "admin") {
        const userData = {
          id: user._id,
          fullName: user.fullName,
          role: "admin"
        };
        saveAuthState("demo-admin-token", userData);
        onLoginSuccess(userData, "demo-admin-token");
      } else {
        setError("Admin user not found or incorrect role.");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[60vh]">
      <Card className="w-full max-w-md p-8 shadow-xl border-gray-100 rounded-3xl bg-white">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo/logo.png"
              alt="UzimaCare Logo"
              width={240}
              height={64}
              className="h-16 w-auto brightness-0"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
          <p className="text-gray-500 text-sm">Sign in to manage system referrals</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
              placeholder="administration@uzimacare.ke"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg transition-all font-bold text-base"
          >
            {loading ? "Verifying..." : "Sign In to Dashboard"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { useConvex } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { saveAuthState } from "../../lib/storage";
import { Button } from "@/components/ui/button";

interface AdminLoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const convex = useConvex();
  const { signIn, signOut } = useAuthActions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      try { await signOut(); } catch (e) { /* Ignore unauthenticated state errors */ }

      // Try signUp first — works for pre-seeded users after a reset (no auth
      // account yet). If the account already exists, fall back to signIn.
      let authenticated = false;
      try {
        await signIn("password", { email, password, flow: "signUp" });
        authenticated = true;
      } catch (_e) {
        // signUp failed — account probably already exists
      }

      if (!authenticated) {
        // signIn — this is the normal path for accounts that already exist
        await signIn("password", { email, password, flow: "signIn" });
      }

      // We successfully signed in (or signed up).
      // DO NOT call `convex.query(api.users.getUserByEmail)` here because the WebSocket hasn't
      // finished attaching the fresh auth token and will throw a "Not authenticated" race condition.
      // Instead, we just trigger the success callback with enough generic info to route to the admin dashboard.
      // The dashboard's `useQuery(api.auth.loggedInUser)` will reliably establish their final role and UI layout.

      const genericAdminData = { email, role: "facility_admin" };
      saveAuthState("convex-session", genericAdminData);
      // Signal the parent that signIn succeeded — the parent’s useQuery-based
      // effect handles navigation once the Convex auth token propagates.
      onLoginSuccess(genericAdminData, "convex-session");

    } catch (err: any) {
      console.error("Login Error:", err);
      // Fallback display to user, stringifying specific message if available
      const errMsg = err?.message || String(err);
      setError("Login failed: " + errMsg.replace("Uncaught Error: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Admin Access</h3>
        <p className="text-gray-500 text-sm">Manage hospital operations and view facility metrics</p>
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
            placeholder="admin@uzimacare.ke"
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

    </div>
  );
}

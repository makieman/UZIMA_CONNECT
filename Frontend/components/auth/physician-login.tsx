"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { saveAuthState } from "../../lib/storage";

interface PhysicianLoginProps {
  onLoginSuccess: (userData: any, authToken: string) => void;
}

export default function PhysicianLogin({
  onLoginSuccess,
}: PhysicianLoginProps) {
  const [email, setEmail] = useState("56845");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const convex = useConvex();
  const { signIn, signOut } = useAuthActions();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      try { await signOut(); } catch (e) { /* Ignore unauthenticated state errors */ }

      const identifier = email.toString().trim();
      let loginEmail = identifier;

      if (!loginEmail.includes("@")) {
        const resolvedEmail = await convex.query(api.physicians.getEmailByLicense, { licenseId: identifier });
        if (resolvedEmail) {
          loginEmail = resolvedEmail;
        } else {
          setError("Physician not found with that License ID.");
          setLoading(false);
          return;
        }
      }

      // Try signUp first — works for pre-seeded users after a reset.
      // If the account already exists, fall back to signIn.
      let authenticated = false;
      try {
        await signIn("password", { email: loginEmail, password, flow: "signUp" });
        authenticated = true;
      } catch (_e) {
        // signUp failed — account probably already exists
      }

      if (!authenticated) {
        await signIn("password", { email: loginEmail, password, flow: "signIn" });
      }

      // Signal the parent that signIn succeeded — the parent’s useQuery-based
      // effect handles navigation once the Convex auth token propagates.
      const placeholderData = {
        role: "physician",
        email: loginEmail,
        licenseId: identifier.includes("@") ? undefined : identifier,
      };
      saveAuthState("convex-session", placeholderData);
      onLoginSuccess(placeholderData, "convex-session");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Physician Access</h3>
        <p className="text-gray-500 text-sm">Enter your License ID to view patient data</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            License ID
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="56845"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Password
            </label>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
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
          className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-base"
        >
          {loading ? "Verifying..." : "Sign In to Portal"}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
        Demo Credentials<br />
        License: <strong className="text-gray-600">56845</strong> | Pass: <strong className="text-gray-600">password</strong>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulation: find physician by license ID suffix
      const identifier = email.toString().trim();
      const allPhysicians = await convex.query(api.physicians.getAllPhysicians);

      const physician = allPhysicians.find((p: any) =>
        p.licenseId === identifier ||
        p.licenseId.endsWith(identifier) ||
        p.user?.email === identifier
      );

      if (physician) {
        // Mock success with Convex data
        const userData = {
          userId: physician.userId,
          id: physician._id,
          fullName: physician.user?.fullName || "Dr. " + (physician.user?.email || ""),
          hospital: physician.hospital,
          role: "physician"
        };
        saveAuthState("demo-token-" + physician._id, userData);
        onLoginSuccess(userData, "demo-token-" + physician._id);
      } else {
        setError("Physician not found with license: " + identifier);
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
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Physician Portal</h2>
          <p className="text-gray-500 text-sm">Enter your credentials to access patient data</p>
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

        <p className="text-center text-xs text-gray-400 mt-8 bg-gray-50 py-2 rounded-lg">
          Demo: License <strong>56845</strong> | Pass: <strong>password</strong>
        </p>
      </Card>
    </div>
  );
}

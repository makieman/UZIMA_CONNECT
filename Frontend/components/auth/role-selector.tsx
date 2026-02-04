"use client";

import type { UserRole } from "../../lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export default function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            Select Your Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure access for healthcare providers and administrators.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Physician */}
          <div
            className="group relative bg-white rounded-3xl p-8 cursor-pointer border-2 border-transparent hover:border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => onSelectRole("physician")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Physician</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create referrals, view patient history, and manage consultations.
              </p>
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                Physician Login
              </Button>
            </div>
          </div>

          {/* Admin */}
          <div
            className="group relative bg-white rounded-3xl p-8 cursor-pointer border-2 border-transparent hover:border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => onSelectRole("admin")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 flex flex-col items-center text-center h-full">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Administration</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Manage hospital referrals, approve requests, and oversee operations.
              </p>
              <Button className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg transition-all">
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

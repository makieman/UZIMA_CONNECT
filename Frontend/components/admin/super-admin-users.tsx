"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Search, UserCog, User, ShieldAlert, ShieldCheck } from "lucide-react";

export default function SuperAdminUsers() {
    const [searchQuery, setSearchQuery] = useState("");
    const users = useQuery(api.users.getAllUsers) || [];

    const filteredUsers = users.filter((u: any) =>
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "super_admin":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3.5 h-3.5" /> Super Admin
                    </span>
                );
            case "facility_admin":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> Facility Admin
                    </span>
                );
            case "physician":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        <UserCog className="w-3.5 h-3.5" /> Physician
                    </span>
                );
            case "patient":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <User className="w-3.5 h-3.5" /> Patient
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        System Users
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Manage all accounts across the platform</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or role..."
                            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium tracking-wider">User</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Role</th>
                                <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
                                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <UserCog className="w-12 h-12 mb-3 text-slate-200" />
                                            <p className="text-base font-medium text-slate-600">No users found</p>
                                            <p className="text-sm">We couldn't find any users matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u: any) => (
                                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                                    {u.fullName?.split(" ").map((n: string) => n[0]).join("").substring(0, 2) || "??"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{u.fullName}</p>
                                                    <p className="text-xs text-slate-500">ID: {u._id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-600 font-medium">{u.email || "No Email"}</p>
                                            <p className="text-xs text-slate-400">{u.phoneNumber || "No Phone"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Edit
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

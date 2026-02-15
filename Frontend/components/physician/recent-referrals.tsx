"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import { Doc } from "../../convex/_generated/dataModel";

interface RecentReferralsProps {
    referrals: Doc<"referrals">[];
    onViewAll: () => void;
}

export default function RecentReferrals({ referrals, onViewAll }: RecentReferralsProps) {
    // Take only the last 5 referrals
    const recent = referrals.slice(0, 5);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
            case "paid":
                return "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400";
            case "pending":
                return "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
            case "failed":
            case "cancelled":
                return "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "paid": return "Completed";
            case "failed": return "Action Req.";
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    const getRandomColor = (id: string) => {
        const colors = [
            "bg-blue-100 text-blue-600 dark:bg-blue-900/40",
            "bg-purple-100 text-purple-600 dark:bg-purple-900/40",
            "bg-pink-100 text-pink-600 dark:bg-pink-900/40",
            "bg-teal-100 text-teal-600 dark:bg-teal-900/40",
            "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40"
        ];
        // Simple hash to get consistent color for same ID
        const charCode = id.charCodeAt(id.length - 1);
        return colors[charCode % colors.length];
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Referrals</h2>
                <Button
                    variant="ghost"
                    className="text-primary text-sm font-semibold hover:text-primary/80 hover:bg-transparent p-0 h-auto"
                    onClick={onViewAll}
                >
                    View All
                </Button>
            </div>

            <div className="space-y-3">
                {recent.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p>No recent referrals found.</p>
                    </div>
                ) : (
                    recent.map((referral) => (
                        <div
                            key={referral._id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRandomColor(referral._id)}`}>
                                    {referral.patientName ? getInitials(referral.patientName) : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {referral.patientName || "Unknown Patient"}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Date: {format(new Date(referral._creationTime), "MMM d, yyyy")} • {referral.department || "General"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border-0 ${getStatusColor(referral.status)}`}>
                                    {getStatusLabel(referral.status)}
                                </Badge>
                                <ChevronRight className="text-gray-300 group-hover:text-gray-400 transition-colors w-5 h-5" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

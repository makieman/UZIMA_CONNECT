"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function IncomingReferralsAdmin({ user }: { user?: any }) {
    const [selectedReferral, setSelectedReferral] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // This query ONLY returns referrals that have been paid/confirmed/completed
    const incomingReferrals = useQuery(api.referrals.getIncomingReferrals, {});
    const updateReferral = useMutation(api.referrals.updateReferralStatus);

    const referrals = incomingReferrals || [];

    const handleStatusUpdate = async (referral: any, newStatus: "pending-admin" | "awaiting-biodata" | "pending-payment" | "confirmed" | "paid" | "completed" | "cancelled") => {
        setLoading(true);
        try {
            await updateReferral({
                referralId: referral._id,
                status: newStatus,
            });
            alert(`Referral marked as ${newStatus} successfully!`);
            setSelectedReferral(null);
        } catch (err: any) {
            alert(`Error updating referral: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "Routine":
                return "bg-green-100 text-green-800";
            case "Urgent":
                return "bg-yellow-100 text-yellow-800";
            case "Emergency":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                    Incoming Referrals
                </h2>
            </div>

            {referrals.length === 0 ? (
                <Card className="p-8 text-center">
                    <p className="text-text-secondary">
                        No incoming referrals awaiting your action.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Referrals will appear here only after the patient has paid.
                    </p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {referrals.map((referral) => (
                        <Card key={referral._id} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">
                                        Patient Name
                                    </p>
                                    <p className="font-semibold">{referral.patientName}</p>
                                    <p className="text-xs text-text-secondary">
                                        ID: {referral.patientId || "N/A"}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    {referral.referralToken && (
                                        <div className="ml-auto text-sm font-mono bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                            {referral.referralToken}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">
                                        Referral Type
                                    </p>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(referral.priority)}`}
                                    >
                                        {referral.priority}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">Status</p>
                                    <p className="font-semibold flex items-center gap-2">
                                        {(referral.status as string) === "paid" && (
                                            <span className="text-green-600">Paid - Action Required</span>
                                        )}
                                        {referral.status === "confirmed" && (
                                            <span className="text-blue-600">Confirmed</span>
                                        )}
                                        {referral.status === "completed" && (
                                            <span className="text-gray-600">Completed</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-border">
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">From</p>
                                    <p className="text-sm font-semibold text-primary">{referral.referringHospital}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary mb-1">Booked Date</p>
                                    <p className="text-sm">{referral.bookedDate || "N/A"}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-text-secondary mb-2">
                                    Medical History & Test Results
                                </p>
                                <details className="text-sm">
                                    <summary className="cursor-pointer font-medium text-primary">
                                        View Medical Details
                                    </summary>
                                    <div className="mt-2 p-3 bg-surface rounded space-y-2">
                                        <div>
                                            <p className="font-medium text-xs">History:</p>
                                            <p className="text-xs text-text-secondary">
                                                {referral.medicalHistory}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs">Lab Results:</p>
                                            <p className="text-xs text-text-secondary">
                                                {referral.labResults}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs">Diagnosis:</p>
                                            <p className="text-xs text-text-secondary">
                                                {referral.diagnosis}
                                            </p>
                                        </div>
                                    </div>
                                </details>
                            </div>

                            <div className="mb-4 p-3 bg-slate-50 rounded space-y-2 border border-slate-100">
                                <p className="text-xs font-semibold">Contact Information</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-text-secondary">Patient Phone:</p>
                                        <p className="font-mono">{referral.patientPhone}</p>
                                    </div>
                                    {referral.patientEmail && (
                                        <div>
                                            <p className="text-text-secondary">Patient Email:</p>
                                            <p className="font-mono">{referral.patientEmail}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {(referral.status as string) === "paid" && (
                                    <Button
                                        onClick={() => handleStatusUpdate(referral, "confirmed")}
                                        disabled={loading}
                                        className="bg-primary text-white hover:opacity-90 text-xs"
                                    >
                                        {loading ? "Processing..." : "Accept & Confirm Booking"}
                                    </Button>
                                )}

                                {referral.status === "confirmed" && (
                                    <Button
                                        onClick={() => handleStatusUpdate(referral, "completed")}
                                        disabled={loading}
                                        className="bg-success text-white hover:opacity-90 text-xs"
                                    >
                                        {loading ? "Processing..." : "Mark as Completed"}
                                    </Button>
                                )}

                                {referral.status === "completed" && (
                                    <div className="text-xs text-gray-500 font-semibold flex items-center">
                                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                                        Medical process finished
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

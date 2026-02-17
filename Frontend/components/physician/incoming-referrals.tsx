"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface IncomingReferralsProps {
    physician: any;
    token: string;
    onBack: () => void;
}

export default function IncomingReferralsPage({
    physician,
    token,
    onBack,
}: IncomingReferralsProps) {
    const [selectedReferral, setSelectedReferral] = useState<any>(null);

    // Fetch incoming referrals for this physician's facility
    const incomingReferrals = useQuery(api.referrals.getIncomingReferrals,
        physician?.hospital ? {
            facilityName: physician.hospital,
            demoUserId: physician.userId
        } : "skip"
    );

    const activeReferrals = incomingReferrals?.filter((r: any) =>
        ["confirmed", "paid", "completed"].includes(r.status)
    ) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Incoming Patients</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage patients referred to <span className="font-semibold text-primary">{physician?.hospital}</span>
                        </p>
                    </div>
                    <Button onClick={onBack} variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Button>
                </div>

                {/* List */}
                {!incomingReferrals ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : activeReferrals.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Active Patients</h3>
                            <p className="text-gray-500 mt-2">There are currently no confirmed referrals assigned to your facility.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {activeReferrals.map((referral: any) => (
                            <Card key={referral._id} className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-grow space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{referral.patientName}</h3>
                                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                                                {referral.priority}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Referred From:</span>
                                                <p className="font-medium">{referral.referringHospital}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Condition:</span>
                                                <p className="font-medium">{referral.diagnosis ? referral.diagnosis.substring(0, 50) + (referral.diagnosis.length > 50 ? "..." : "") : "N/A"}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Arrival Date:</span>
                                                <p className="font-medium">{new Date(referral.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        <Button
                                            className="w-full sm:w-auto"
                                            onClick={() => setSelectedReferral(referral)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Details Modal */}
                {selectedReferral && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 z-10">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    Patient Referral Details
                                </h2>
                                <button
                                    onClick={() => setSelectedReferral(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Patient Header Info */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Patient</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{selectedReferral.patientName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">ID</p>
                                        <p className="font-medium">{selectedReferral.patientId || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Read-Only Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Clinical History</h4>
                                        <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedReferral.medicalHistory}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Lab Results</h4>
                                        <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedReferral.labResults}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Assessment</h4>
                                        <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedReferral.diagnosis}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                                        <Button
                                            onClick={() => setSelectedReferral(null)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}


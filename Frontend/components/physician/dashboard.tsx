"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateReferralPage from "./create-referral";
import PendingReferralsPage from "./pending-referrals";
import CompletedReferralsPage from "./completed-referrals";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PhysicianDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

type PhysicianPage = "dashboard" | "create" | "pending" | "completed";

export default function PhysicianDashboard({
  user,
  token,
  onLogout,
}: PhysicianDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PhysicianPage>("dashboard");
  const [counts, setCounts] = useState({ pending: 0, completed: 0 });

  const physicianId = user?.id as Id<"physicians">;

  const referrals = useQuery(api.referrals.getReferralsByPhysician,
    physicianId ? { physicianId, demoUserId: user?.userId } : "skip"
  );

  useEffect(() => {
    if (referrals) {
      setCounts({
        pending: referrals.filter(r =>
          !["paid", "completed", "cancelled"].includes(r.status)
        ).length,
        completed: referrals.filter(r =>
          ["paid", "completed"].includes(r.status)
        ).length
      });
    }
  }, [referrals]);

  if (currentPage === "create") {
    return (
      <CreateReferralPage
        physician={user}
        token={token}
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  if (currentPage === "pending") {
    return (
      <PendingReferralsPage
        physician={user}
        token={token}
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  if (currentPage === "completed") {
    return (
      <CompletedReferralsPage
        physician={user}
        token={token}
        onBack={() => setCurrentPage("dashboard")}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-1">
          Physician Portal
        </h2>
        <p className="text-text-secondary">
          Manage your patient referrals and track their progress
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Create New Referral */}
        <Card
          className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary bg-white group"
          onClick={() => setCurrentPage("create")}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Create Referral</h3>
            <p className="text-text-secondary mb-6 line-clamp-2">
              Start a new referral process for a patient
            </p>
            <Button className="w-full bg-primary hover:bg-primary-light text-white shadow-md">
              New Referral
            </Button>
          </div>
        </Card>

        {/* Pending Referrals */}
        <Card
          className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-warning bg-white group"
          onClick={() => setCurrentPage("pending")}
        >
          <div className="flex flex-col items-center text-center relative">
            {counts.pending > 0 && (
              <span className="absolute top-0 right-0 bg-warning text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {counts.pending}
              </span>
            )}
            <div className="w-16 h-16 bg-warning/10 text-warning rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Pending</h3>
            <p className="text-text-secondary mb-6 line-clamp-2">
              Track referrals awaiting approval or payment
            </p>
            <Button className="w-full bg-warning hover:bg-warning/90 text-white shadow-md">
              View Pending
            </Button>
          </div>
        </Card>

        {/* Completed Referrals */}
        <Card
          className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-success bg-white group"
          onClick={() => setCurrentPage("completed")}
        >
          <div className="flex flex-col items-center text-center relative">
            {counts.completed > 0 && (
              <span className="absolute top-0 right-0 bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {counts.completed}
              </span>
            )}
            <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Completed</h3>
            <p className="text-text-secondary mb-6 line-clamp-2">
              History of successfully processed referrals
            </p>
            <Button className="w-full bg-success hover:bg-success/90 text-white shadow-md">
              View History
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}


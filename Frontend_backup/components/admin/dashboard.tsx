"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PendingPhysicianReferrals from "./pending-physician-referrals";
import CalendarView from "./calendar-view";
import CompletedReferrals from "./completed-referrals";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AdminDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

type AdminView = "overview" | "pending-referrals" | "calendar" | "completed";

export default function AdminDashboard({
  user,
  token,
  onLogout,
}: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("overview");

  const adminStats = useQuery(api.stats.getAdminStats, {
    demoUserId: user?.id
  });

  const stats = adminStats || {
    total: 0,
    completed: 0,
    pending: 0,
    expired: 0
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <Button
          onClick={() => setCurrentView("overview")}
          className={
            currentView === "overview"
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }
        >
          Overview
        </Button>
        <Button
          onClick={() => setCurrentView("pending-referrals")}
          className={
            currentView === "pending-referrals"
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }
        >
          Pending Referrals {stats.pending > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.pending}
            </span>
          )}
        </Button>
        <Button
          onClick={() => setCurrentView("calendar")}
          className={
            currentView === "calendar"
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }
        >
          Calendar
        </Button>
        <Button
          onClick={() => setCurrentView("completed")}
          className={
            currentView === "completed"
              ? "bg-primary text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }
        >
          Completed
        </Button>
      </div>

      {/* Content */}
      {currentView === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6 border-l-4 border-primary shadow-sm">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Total Referrals
              </h3>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-success text-xs mt-2 font-medium">↑ 12% from last month</p>
            </Card>
            <Card className="p-6 border-l-4 border-success shadow-sm">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Completed
              </h3>
              <p className="text-4xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-text-secondary text-xs mt-2">
                {((stats.completed / (stats.total || 1)) * 100).toFixed(1)}% completion
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-warning shadow-sm">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Pending Action
              </h3>
              <p className="text-4xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-text-secondary text-xs mt-2">
                Awaiting admin review
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-error shadow-sm">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">Expired</h3>
              <p className="text-4xl font-bold text-gray-900">{stats.expired}</p>
              <p className="text-text-secondary text-xs mt-2">
                No response/payment
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Recent Referrals */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Referrals</h3>
                <Button variant="ghost" className="text-primary text-sm hover:text-primary-light" onClick={() => setCurrentView("pending-referrals")}>
                  View All
                </Button>
              </div>
              <Card className="divide-y divide-gray-100">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${i === 2 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{['Mark Maranga', 'Peter Otieno', 'Jane Doe'][i]}</p>
                        <p className="text-xs text-gray-500">{['DYWF79', 'XYZ789', 'ABC123'][i]} • 2/4/2026</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase text-gray-700">{['Diagnostic', 'Consultation', 'Diagnostic'][i]}</p>
                      <p className={`text-[10px] font-bold uppercase ${i === 2 ? 'text-green-600' : 'text-orange-500'}`}>
                        {i === 2 ? 'Completed' : 'Pending Payment'}
                      </p>
                    </div>
                  </div>
                ))}
              </Card>
            </div>

            {/* Action Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Action Items</h3>
              <Card className="p-5 bg-orange-50 border border-orange-100">
                <h4 className="font-semibold text-orange-900 mb-1">Verify Payments</h4>
                <p className="text-sm text-orange-700 mb-3">2 referrals are awaiting payment confirmation</p>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white border-none py-1 h-auto text-sm"
                  onClick={() => setCurrentView("pending-referrals")}
                >
                  Process Pending
                </Button>
              </Card>
              <Card className="p-5 bg-blue-50 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-1">Weekly Reports</h4>
                <p className="text-sm text-blue-700 mb-3">Generate medical outcome reports for the past week.</p>
                <Button className="w-full bg-primary hover:bg-primary-light text-white border-none py-1 h-auto text-sm">
                  Download PDF
                </Button>
              </Card>
            </div>
          </div>
        </>
      )}

      <div className="mt-6">
        {currentView === "pending-referrals" && <PendingPhysicianReferrals user={user} />}
        {currentView === "calendar" && <CalendarView />}
        {currentView === "completed" && <CompletedReferrals user={user} />}
      </div>
    </div>
  );
}


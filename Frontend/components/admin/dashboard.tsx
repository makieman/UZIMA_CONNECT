"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OutgoingReferrals from "./outgoing-referrals";
import IncomingReferralsAdmin from "./incoming-referrals-admin";
import CalendarView from "./calendar-view";
import CompletedReferrals from "./completed-referrals";
import HospitalManagement from "./hospital-management";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import PhysiciansManagement from "./physicians-management";
import SuperAdminUsers from "./super-admin-users";
import { LayoutDashboard, Stethoscope, ArrowDownLeft, ArrowUpRight, Users, Settings, LogOut, HeartPulse, FileText, PieChart, Building2 } from "lucide-react";

interface AdminDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

type AdminView = "overview" | "physicians" | "outgoing" | "incoming" | "calendar" | "completed" | "hospitals" | "users" | "referrals";

export default function AdminDashboard({
  user,
  token,
  onLogout,
}: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>("overview");

  const adminStats = useQuery(api.stats.getAdminStats, {});
  const superAdminStats = useQuery(api.stats.getSuperAdminStats, user.role === "super_admin" ? {} : "skip");

  const stats = adminStats || {
    total: 0,
    completed: 0,
    pending: 0,
    expired: 0,
    outgoing: 0,
    incoming: 0
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      {user.role === "super_admin" ? (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 text-white">
          <div className="p-6 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight">Afya Connect</span>
          </div>

          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-slate-500 mb-4 px-2 tracking-wider">Navigation</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "overview" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentView("hospitals")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "hospitals" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <Building2 className="w-4 h-4" />
                Hospitals
              </button>

              <button
                onClick={() => setCurrentView("users")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "users" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <Users className="w-4 h-4" />
                Users
              </button>

              <button
                onClick={() => setCurrentView("referrals")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "referrals" ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
              >
                <FileText className="w-4 h-4" />
                Referrals
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      ) : (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
          <div className="p-6 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">Afya Connect</span>
          </div>

          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-slate-400 mb-4 px-2 tracking-wider">Navigation</p>
            <nav className="space-y-1">
              <button
                onClick={() => setCurrentView("overview")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "overview" ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => setCurrentView("physicians")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "physicians" ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Stethoscope className="w-4 h-4" />
                Physicians
              </button>

              <button
                onClick={() => setCurrentView("incoming")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "incoming" ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span className="flex-1 text-left">Incoming Referrals</span>
                {stats.incoming > 0 && (
                  <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {stats.incoming}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentView("outgoing")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentView === "outgoing" ? "bg-slate-100 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span className="flex-1 text-left">Outgoing Referrals</span>
                {stats.pending > 0 && (
                  <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-[10px] font-bold">
                    {stats.pending}
                  </span>
                )}
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium text-slate-800 border-l border-slate-300 pl-3">
              {user.role === "super_admin" ? "Super Admin" : "Hospital Admin"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
              {user.fullName?.split(" ").map((n: string) => n[0]).join("") || "AD"}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {currentView === "overview" && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Hospital Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">{user.hospitalId ? "Facility Overview" : "System Overview"}</p>
              </div>

              {user.role === "super_admin" ? (
                // SUPER ADMIN OVERVIEW CARDS
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Total Hospitals</h3>
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{superAdminStats?.totalHospitals || 0}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +2 this month
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Active Physicians</h3>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{superAdminStats?.totalPhysicians || 0}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +12 this month
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Total Referrals</h3>
                      <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{superAdminStats?.totalReferrals || 0}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +15% vs last month
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{superAdminStats?.totalUsers || 0}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> +8% vs last month
                      </p>
                    </div>
                  </Card>
                </div>
              ) : (
                // FACILITY ADMIN OVERVIEW CARDS
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Total Referrals</h3>
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                      <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> 12% from last month
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Completed</h3>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.completed}</p>
                      <p className="text-slate-500 text-xs mt-2 font-medium">
                        {((stats.completed / (stats.total || 1)) * 100).toFixed(1)}% completion rate
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Pending Action</h3>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                      <p className="text-slate-500 text-xs mt-2 font-medium">
                        Awaiting admin review / payment
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-slate-500">Expired</h3>
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <LogOut className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">{stats.expired}</p>
                      <p className="text-slate-500 text-xs mt-2 font-medium">
                        Action required
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {user.role === "super_admin" ? (
                  // Super Admin charts placeholders
                  <>
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">Referral Trends</h3>
                      <Card className="p-6 border border-slate-200 shadow-sm h-64 flex items-center justify-center">
                        <div className="text-center">
                          <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-medium">Analytics coming soon</p>
                        </div>
                      </Card>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">Status Breakdown</h3>
                      <Card className="p-6 border border-slate-200 shadow-sm h-64 flex items-center justify-center">
                        <div className="text-center flex flex-col items-center">
                          <div className="w-32 h-32 rounded-full border-[16px] border-emerald-500 border-t-amber-500 border-r-blue-500 border-b-rose-500 opacity-80" />
                        </div>
                      </Card>
                    </div>
                  </>
                ) : (
                  // Facility Admin Action Items
                  <>
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent Referrals</h3>
                        <Button variant="ghost" className="text-primary text-sm hover:bg-slate-100" onClick={() => setCurrentView("outgoing")}>
                          View All
                        </Button>
                      </div>
                      <Card className="divide-y divide-slate-100 border border-slate-200 shadow-sm">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`p-2.5 rounded-lg ${i === 2 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {i === 2 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{['Mark Maranga', 'Peter Otieno', 'Jane Doe'][i]}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{['DYWF79', 'XYZ789', 'ABC123'][i]} • {i === 2 ? 'Incoming' : 'Outgoing'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-700">{['Diagnostic', 'Consultation', 'Diagnostic'][i]}</p>
                              <p className={`text-xs font-bold uppercase mt-1 ${i === 2 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {i === 2 ? 'Completed' : 'Pending Payment'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900">Action Items</h3>
                      <Card className="p-5 bg-amber-50/50 border border-amber-200 shadow-sm">
                        <h4 className="font-semibold text-amber-900 mb-2">Verify Payments</h4>
                        <p className="text-sm text-amber-700 mb-4 tracking-wide leading-relaxed">2 referrals are awaiting payment confirmation before they can be processed.</p>
                        <Button
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                          onClick={() => setCurrentView("outgoing")}
                        >
                          Process Pending
                        </Button>
                      </Card>
                      <Card className="p-5 bg-blue-50/50 border border-blue-200 shadow-sm">
                        <h4 className="font-semibold text-blue-900 mb-2">Weekly Reports</h4>
                        <p className="text-sm text-blue-700 mb-4 tracking-wide leading-relaxed">Generate medical outcome reports for the past week across your facility.</p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                          Download PDF
                        </Button>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentView === "physicians" && <PhysiciansManagement user={user} />}
            {currentView === "outgoing" && <OutgoingReferrals user={user} />}
            {currentView === "incoming" && <IncomingReferralsAdmin user={user} />}
            {currentView === "calendar" && <CalendarView />}
            {currentView === "completed" && <CompletedReferrals user={user} />}
            {currentView === "hospitals" && user?.role === "super_admin" && <HospitalManagement />}
            {currentView === "users" && user?.role === "super_admin" && <SuperAdminUsers />}
            {currentView === "referrals" && user?.role === "super_admin" && <OutgoingReferrals user={user} />}  {/* Reusing outgoing for all referrals for now */}
          </div>
        </main>
      </div>
    </div>
  );
}


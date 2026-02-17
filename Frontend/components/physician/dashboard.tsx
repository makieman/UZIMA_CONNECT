"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreateReferralPage from "./create-referral";
import PendingReferralsPage from "./pending-referrals";
import CompletedReferralsPage from "./completed-referrals";
import IncomingReferralsPage from "./incoming-referrals";
import RecentReferrals from "./recent-referrals";
import ReferralActivityChart from "./referral-chart";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Search,
  Bell,
  ClipboardList,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ArrowDownLeft
} from "lucide-react";

interface PhysicianDashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

type PhysicianPage = "dashboard" | "create" | "pending" | "completed" | "incoming";

export default function PhysicianDashboard({
  user,
  token,
  onLogout,
}: PhysicianDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PhysicianPage>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    urgent: 0
  });

  const physicianId = user?.id as Id<"physicians">;

  const referrals = useQuery(api.referrals.getReferralsByPhysician,
    physicianId ? { physicianId, demoUserId: user?.userId } : "skip" // Handle demo user or real ID
  );

  useEffect(() => {
    if (referrals) {
      setCounts({
        total: referrals.length,
        pending: referrals.filter(r =>
          !["paid", "completed", "cancelled", "failed"].includes(r.status)
        ).length,
        completed: referrals.filter(r =>
          ["paid", "completed"].includes(r.status)
        ).length,
        urgent: referrals.filter(r =>
          ["failed", "cancelled"].includes(r.status)
        ).length
      });
    }
  }, [referrals]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Page Routing Logic
  if (currentPage === "create") {
    return <CreateReferralPage physician={user} token={token} onBack={() => setCurrentPage("dashboard")} />;
  }
  if (currentPage === "pending") {
    return <PendingReferralsPage physician={user} token={token} onBack={() => setCurrentPage("dashboard")} />;
  }
  if (currentPage === "completed") {
    return <CompletedReferralsPage physician={user} token={token} onBack={() => setCurrentPage("dashboard")} />;
  }
  if (currentPage === "incoming") {
    return <IncomingReferralsPage physician={user} token={token} onBack={() => setCurrentPage("dashboard")} />;
  }

  // Calculate Percentage Growth (Mock for demo)
  const growth = "+12%";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900">

        {/* Header */}
        <header className="bg-primary text-white pt-6 pb-12 px-4 sm:px-6 rounded-b-[2.5rem] shadow-lg relative z-20 transition-all duration-300">
          <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
            {/* Logo and Profile */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/logo/logo.png"
                  alt="UzimaCare Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto"
                  priority
                />
                <span className="font-bold text-lg hidden sm:block">Uzima<span className="text-blue-200">Care</span></span>
              </Link>
              <div className="h-8 w-px bg-white/20 mx-2 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <div className="relative group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md bg-white/10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                    <span className="text-lg font-bold">{user?.name ? user.name.charAt(0) : "J"}</span>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-white font-bold text-base leading-tight">
                    {user?.name || "Dr. James Kipchoge"}
                  </h1>
                  <p className="text-blue-100 text-xs font-medium opacity-90">
                    {user?.hospital || "Nairobi Central Hospital"}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full transition-colors focus:ring-2 focus:ring-white/30"
                onClick={onLogout}
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full transition-colors focus:ring-2 focus:ring-white/30 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full"></span>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`md:hidden absolute top-full left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 z-30 ${mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">{user?.name ? user.name.charAt(0) : "J"}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{user?.name || "Dr. James Kipchoge"}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.hospital || "Nairobi Central Hospital"}</p>
                </div>
              </div>
              <button
                onClick={() => { setCurrentPage("dashboard"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => { setCurrentPage("pending"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Hourglass className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Pending Referrals</span>
                {counts.pending > 0 && (
                  <span className="ml-auto bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{counts.pending}</span>
                )}
              </button>
              <button
                onClick={() => { setCurrentPage("completed"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium">Completed</span>
              </button>
              <button
                onClick={() => { setCurrentPage("incoming"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowDownLeft className="w-5 h-5 text-purple-600" />
                <span className="font-medium">My Patients (Incoming)</span>
              </button>
              <button
                onClick={() => { setCurrentPage("create"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
                <span className="font-medium">New Referral</span>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative group max-w-5xl mx-auto -mb-6 z-20">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-2xl py-4 pl-12 pr-4 shadow-xl shadow-blue-900/10 border border-transparent focus:border-blue-100 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all outline-none text-sm font-medium"
              placeholder="Search Patient ID, Name, or Department..."
              type="text"
              aria-label="Search patients"
            />
          </div>
        </header>

        <main className="px-4 sm:px-6 -mt-2 relative z-10 space-y-8 max-w-5xl mx-auto pb-8">

          {/* Stats Section */}
          <section className="pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {/* Total Referrals */}
              <button
                onClick={() => setCurrentPage("completed")}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-l-primary flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/30 text-left"
                aria-label={`View ${counts.total} total referrals`}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <ClipboardList className="text-primary w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    {growth}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Referrals</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{counts.total}</h3>
                </div>
              </button>

              {/* Incoming Patients */}
              <button
                onClick={() => setCurrentPage("incoming")}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-l-purple-500 flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-left"
                aria-label="View incoming patients"
              >
                <div className="flex justify-between items-start">
                  <div className="bg-purple-50 dark:bg-purple-900/30 p-2.5 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                    <ArrowDownLeft className="text-purple-500 w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 flex items-center bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Incoming Patients</p>
                  <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-1">View & Admit</h3>
                </div>
              </button>

              {/* Completed */}
              <button
                onClick={() => setCurrentPage("completed")}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-l-green-500 flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-green-500/30 text-left"
                aria-label={`View ${counts.completed} completed referrals`}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-green-50 dark:bg-green-900/30 p-2.5 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                    <CheckCircle2 className="text-green-500 w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{counts.completed}</h3>
                </div>
              </button>

              {/* Needs Action */}
              <button
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-red-500/30 text-left"
                aria-label={`${counts.urgent} referrals need action`}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-red-50 dark:bg-red-900/30 p-2.5 rounded-xl group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                    <AlertCircle className="text-red-500 w-6 h-6" />
                  </div>
                  {counts.urgent > 0 && (
                    <span className="text-[10px] font-bold text-red-600 flex items-center bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Needs Action</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{counts.urgent}</h3>
                </div>
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Chart Section */}
            <div className="lg:col-span-2 space-y-6">
              <ReferralActivityChart referrals={referrals || []} />
            </div>

            {/* Recent Referrals */}
            <div className="lg:col-span-1">
              <RecentReferrals referrals={referrals || []} onViewAll={() => setCurrentPage("completed")} />
            </div>
          </div>

        </main>

        {/* Floating Action Button */}
        <button
          className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-primary text-white w-14 h-14 rounded-full shadow-xl shadow-blue-500/40 flex items-center justify-center hover:bg-blue-600 hover:scale-110 active:scale-95 transition-all z-50 group focus:outline-none focus:ring-4 focus:ring-primary/30"
          onClick={() => setCurrentPage("create")}
          aria-label="Create new referral"
        >
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
          <span className="sr-only">New Referral</span>
        </button>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 px-8 py-3 flex justify-between items-center z-40 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:hidden" role="navigation" aria-label="Mobile navigation">
          <button
            className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 text-primary"
            onClick={() => setCurrentPage("dashboard")}
            aria-label="Dashboard"
            aria-current="page"
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-400 hover:text-primary"
            onClick={() => setCurrentPage("pending")}
            aria-label="Patients"
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">Patients</span>
          </button>
          <div className="w-10"></div> {/* Spacer for FAB */}
          <button
            className="flex flex-col items-center space-y-1 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-400 hover:text-primary"
            onClick={() => setCurrentPage("create")}
            aria-label="Create Referral"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-medium">Create</span>
          </button>
          <button
            className="flex flex-col items-center text-gray-400 hover:text-red-600 transition-colors space-y-1 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

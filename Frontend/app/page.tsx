"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthState } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();

  // Check auth on load - if logged in, redirect to dashboard
  useEffect(() => {
    const auth = getAuthState();
    if (auth && auth.user) {
      if (auth.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (auth.user.role === "physician") {
        router.push("/physician/dashboard");
      }
    }
  }, [router]);

  // Logic Simulator for Diagram
  const [currentStep, setCurrentStep] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev % 4) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background-light text-text-main font-sans antialiased overflow-x-hidden min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background-light/95 backdrop-blur-md border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35V20H35C35 11.7157 28.2843 5 20 5Z" fill="#22C55E"></path>
                    <path d="M20 35C28.2843 35 35 28.2843 35 20H20V35Z" fill="#EF4444"></path>
                    <circle cx="20" cy="20" fill="white" r="4"></circle>
                  </svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">Uzima<span className="text-primary">Care</span></span>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a className="text-slate-600 hover:text-primary transition-colors px-3 py-2 text-sm font-medium" href="#">Features</a>
              <a className="text-slate-600 hover:text-primary transition-colors px-3 py-2 text-sm font-medium" href="#">How it Works</a>
              <a className="text-slate-600 hover:text-primary transition-colors px-3 py-2 text-sm font-medium" href="#">Partners</a>
            </div>
            <div className="flex items-center">
              <Link href="/login">
                <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg shadow-blue-500/10 transition-all cursor-pointer">
                  Login Portal
                </button>
              </Link>
              <button className="ml-3 md:hidden p-2 rounded-md text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 bg-white">
        <div className="gradient-orb bg-blue-100 top-0 right-0 -mr-20 -mt-20"></div>
        <div className="gradient-orb bg-green-50 bottom-0 left-0 -ml-20 mb-20"></div>

        <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Now Live across 47 Counties</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl tracking-tight mb-6 leading-[1.15]">
            <span className="font-serif block text-slate-900 mb-1">Digital Referrals.</span>
            <span className="font-bold block text-primary mb-1">Faster Care.</span>
            <span className="font-serif block text-slate-900">Better Outcomes.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-md mb-8 leading-relaxed">
            Eliminate paper-based delays. Track referrals in real-time. Ensure continuity of care across Kenyan healthcare facilities.
          </p>
          <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 mb-8 lg:mb-12">
            <Link href="/login">
              <button className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 cursor-pointer">
                Get Started
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-800 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm cursor-pointer">
              Book a Demo
            </button>
          </div>
        </div>


        <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center mt-6 lg:mt-0">
          <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] max-w-md lg:max-w-xl mx-auto">
            <div className="absolute inset-0 z-0">
              <svg className="w-full h-full opacity-60" preserveAspectRatio="xMidYMid meet" viewBox="0 0 400 400">
                <path className="animate-pulse" d="M200 200 Q 100 280 60 320" fill="none" stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5"></path>
                <path d="M200 200 Q 300 120 340 80" fill="none" stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5"></path>
                <path d="M200 200 Q 120 120 80 80" fill="none" stroke="#F1F5F9" strokeWidth="1.5"></path>
                <path d="M200 200 Q 280 280 320 320" fill="none" stroke="#F1F5F9" strokeWidth="1.5"></path>
                <circle cx="200" cy="200" fill="url(#mainGradient)" opacity="0.1" r="120"></circle>
                <defs>
                  <radialGradient id="mainGradient">
                    <stop offset="0%" stopColor="#007AFF"></stop>
                    <stop offset="100%" stopColor="transparent"></stop>
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div className="absolute inset-4 sm:inset-8 z-10 rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white">
              <img alt="Dr. Sarah Kimani using a tablet" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXnud6bnkeMXgAR1b91vbMDGiQW-C_pFO8-W9cZXzTnQDnn4d6B-zI53W6g84sD0430uDTf8yT1zNFN9w7A1qJWCsI6ivkHN8LtoagT43mNgit4duSDFIqueZtbhTJj815Bvt8wVLJkq2GyAM8JDc_mivk-NVO7fOyEBGUVVyzY5IG_P2jWmxLRUWQv_TjIG78mCk3BfyXUrrcQVvhxvC2wVx5SX47yZ5zKtwUXCkALRY-MI75b3Wr5h_Z60MlueelaP-19AyCI1lE" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-sm text-white">Dr. Sarah Kimani</p>
                <p className="text-xs text-white/90">Pediatric Specialist</p>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-[5%] right-[-5%] z-20 animate-float-slow">
              <div className="glass-card p-3 rounded-xl shadow-soft-card max-w-[160px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
                </div>
                <div className="text-sm font-bold text-slate-800 leading-tight">Referral Sent</div>
                <div className="text-[10px] text-slate-400 mt-1">Just now • Patient #892</div>
              </div>
            </div>

            <div className="absolute top-[40%] left-[-8%] z-30 animate-float-medium">
              <div className="glass-card px-4 py-2.5 rounded-full flex items-center gap-3 shadow-soft-card border-l-4 border-l-primary">
                <span className="material-symbols-outlined text-primary text-xl">hub</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">Uzima Hub</span>
                  <span className="text-[8px] text-slate-500">Connected</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[10%] left-[-4%] z-20 animate-float-fast">
              <div className="glass-card p-2.5 rounded-lg shadow-soft-card flex items-center gap-2">
                <div className="bg-blue-50 p-1.5 rounded-md text-primary">
                  <span className="material-symbols-outlined text-lg">cloud_done</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-600">Secure Cloud</div>
                  <div className="text-[8px] text-green-600 font-medium">Synced</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[20%] right-[-8%] z-20 animate-float-medium" style={{ animationDelay: '1s' }}>
              <div className="glass-card p-3 rounded-lg shadow-soft-card max-w-[150px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-blue-500 text-[14px]">near_me</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Destination</span>
                </div>
                <div className="text-xs font-bold text-slate-800">Kenyatta Hospital</div>
                <div className="flex items-center gap-1 mt-1 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 w-fit">
                  <span className="material-symbols-outlined text-green-600 text-[10px]">check_circle</span>
                  <span className="text-[9px] text-green-700 font-medium">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Why UzimaCare Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background-subtle border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">WHY UZIMACARE?</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
              Solving real problems in Kenya's referral system with modern, accessible technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 border border-slate-100 group">
              <div className="w-full h-40 mb-6 bg-slate-50 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-100">
                <div className="w-16 h-28 border-4 border-slate-300 bg-white rounded-xl relative z-10 flex flex-col items-center justify-center shadow-sm">
                  <div className="w-6 h-1 bg-slate-200 rounded-full mb-1"></div>
                  <div className="w-12 h-20 bg-slate-50 rounded overflow-hidden p-1">
                    <div className="w-full h-full bg-slate-100 rounded-sm"></div>
                  </div>
                </div>
                <div className="absolute left-1/4 top-1/2 -translate-y-1/2 z-20 animate-slide-in-blur">
                  <div className="w-10 h-12 bg-white border border-slate-200 shadow-sm rounded flex items-center justify-center transform -rotate-12">
                    <span className="material-symbols-outlined text-primary text-xl">description</span>
                  </div>
                </div>
                <div className="absolute w-24 h-1 bg-gradient-to-r from-transparent to-blue-100 blur-sm left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-4"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">Faster Referrals</h3>
              <p className="text-slate-600 leading-relaxed">
                Replace paper with instant digital referrals — reduce wait from days to minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 border border-slate-100 group">
              <div className="w-full h-40 mb-6 bg-green-50/40 rounded-xl flex items-center justify-center relative border border-green-50">
                <div className="absolute w-24 h-24 bg-green-100/50 rounded-full animate-pulse-slow"></div>
                <div className="absolute w-20 h-20 bg-green-200/30 rounded-full animate-pulse"></div>
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-brand-green text-6xl drop-shadow-sm">security</span>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                    <span className="material-symbols-outlined text-slate-500 text-xl">lock</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-green transition-colors">Secure & Compliant</h3>
              <p className="text-slate-600 leading-relaxed">
                End-to-end encryption. Compliant with Kenyan health data regulations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 border border-slate-100 group">
              <div className="w-full h-40 mb-6 bg-yellow-50/40 rounded-xl flex items-center justify-center relative overflow-hidden border border-yellow-50">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="absolute bottom-[-20px]">
                    <svg className="w-24 h-32" fill="none" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
                      <rect className="fill-slate-300" height="120" rx="10" width="70" x="15" y="5"></rect>
                      <rect className="fill-slate-800" height="100" rx="4" width="62" x="19" y="15"></rect>
                      <rect className="fill-green-600 animate-pulse" height="20" rx="2" width="54" x="23" y="25"></rect>
                      <text className="fill-white text-[6px] font-bold" x="30" y="38">STK PUSH SENT</text>
                      <path className="fill-amber-600 opacity-90" d="M15 80 C 15 80, 5 90, 10 110 L 85 110 C 90 90, 80 80, 80 80 L 15 80 Z"></path>
                    </svg>
                  </div>
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200 animate-float-bubble z-20">
                    <span className="text-[10px] font-mono font-bold text-slate-600">*334#</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">Mobile-First</h3>
              <p className="text-slate-600 leading-relaxed">
                Works on any device. STK push payments. USSD fallback for low-connectivity areas.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 border border-slate-100 group">
              <div className="w-full h-40 mb-6 bg-purple-50/40 rounded-xl flex items-center justify-center relative border border-purple-50">
                <div className="relative w-32 h-32 flex items-end justify-center gap-2 pb-4">
                  <div className="w-4 bg-purple-200 rounded-t h-12"></div>
                  <div className="w-4 bg-purple-300 rounded-t h-16"></div>
                  <div className="w-4 bg-purple-400 rounded-t h-20"></div>
                  <div className="w-4 bg-purple-500 rounded-t h-24 relative">
                    <div className="absolute -top-14 -right-12 z-20 animate-bounce-gentle">
                      <div className="bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1.5 transform rotate-6">
                        <span className="material-symbols-outlined text-purple-600 text-sm">sell</span>
                        <span className="text-xs font-bold text-slate-800 whitespace-nowrap">0 Hidden Fees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">Transparent Pricing</h3>
              <p className="text-slate-600 leading-relaxed">
                Start with a free pilot. Scale affordably with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section (Uzima Network) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-10">
            <h2 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">THE UZIMA NETWORK</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 max-w-3xl mx-auto leading-tight">
              Seamless connectivity across the healthcare ecosystem.
            </p>
          </div>
          <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center gap-8">
            <div className="relative w-full aspect-[16/10] md:aspect-[21/9] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(241,245,249,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(241,245,249,0.3)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
              <img
                alt="3D illustration showing connected clinics and cloud network"
                className="w-full h-full object-cover mx-auto opacity-70 mix-blend-multiply"
                src="/logo/landing.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent"></div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
                <path className={`transition-all duration-1000 ${currentStep >= 1 ? 'stroke-primary' : 'stroke-slate-200'}`} d="M 150 280 C 250 280, 250 200, 400 200" fill="none" strokeWidth="2"></path>
                <path className={`stroke-primary ${currentStep === 1 ? 'animate-flow-line-1' : 'opacity-0'}`} d="M 150 280 C 250 280, 250 200, 400 200" fill="none" strokeDasharray="10 200" strokeLinecap="round" strokeWidth="4"></path>

                <path className={`transition-all duration-1000 ${currentStep >= 3 ? 'stroke-primary' : 'stroke-slate-200'}`} d="M 400 200 C 550 200, 550 120, 650 120" fill="none" strokeWidth="2"></path>
                <path className={`stroke-primary ${currentStep === 3 ? 'animate-flow-line-2' : 'opacity-0'}`} d="M 400 200 C 550 200, 550 120, 650 120" fill="none" strokeDasharray="10 200" strokeLinecap="round" strokeWidth="4"></path>

                <circle className={`transition-colors duration-500 ${currentStep >= 2 ? 'fill-primary/5 stroke-primary' : 'fill-white stroke-slate-200'}`} cx="400" cy="200" r="40" strokeWidth="1"></circle>
                <circle className={`fill-primary/10 ${currentStep === 2 ? 'animate-ping' : 'opacity-0'}`} cx="400" cy="200" r="30"></circle>
              </svg>

              <div className="absolute bottom-[20%] left-[10%] md:left-[8%] z-20">
                <div className={`glass-card px-4 py-2.5 rounded-xl shadow-soft-card flex items-start flex-col gap-1 border transition-all duration-500 ${currentStep === 1 ? 'border-primary ring-4 ring-primary/10 scale-110' : 'border-slate-200 opacity-60'}`}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className={`absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 ${currentStep === 1 ? 'animate-ping' : ''}`}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Source</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">Digital Referral</span>
                </div>
              </div>

              <div className="absolute top-[20%] right-[10%] md:right-[15%] z-20">
                <div className={`glass-card px-4 py-2.5 rounded-xl shadow-soft-card flex items-start flex-col gap-1 border transition-all duration-1000 ${currentStep === 4 ? 'border-green-500 ring-4 ring-green-500/10 scale-110' : 'border-slate-200 opacity-60'}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Destination</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-lg transition-colors ${currentStep === 4 ? 'text-green-500' : 'text-slate-400'}`}>domain</span>
                    <span className="text-sm font-bold text-slate-900">Hospital Network</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                <div className={`glass-card w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-700 ${currentStep === 2 || currentStep === 3 ? 'border-primary shadow-blue-500/20 scale-110 animate-step-pulse' : 'border-white shadow-none'}`}>
                  <div className="relative">
                    <span className={`material-symbols-outlined text-4xl transition-colors ${currentStep >= 2 ? 'text-primary' : 'text-slate-300'}`}>hub</span>
                    <div className={`absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white transition-opacity duration-500 ${currentStep === 4 ? 'opacity-100' : 'opacity-0'}`}>
                      <span className="material-symbols-outlined text-white text-[10px] block font-bold">check</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`absolute top-[15%] left-[10%] md:left-[15%] z-20 transition-all duration-700 ${currentStep === 3 ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>
                <div className={`glass-card px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 border ${currentStep === 3 ? 'border-blue-200 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="text-xs font-bold uppercase tracking-tight">Verified</span>
                </div>
              </div>

              <div className={`absolute bottom-[20%] right-[10%] md:right-[18%] z-20 transition-all duration-700 ${currentStep === 1 ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>
                <div className="glass-card px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 border border-slate-100">
                  <span className="material-symbols-outlined text-slate-400 text-sm">payments</span>
                  <span className="text-xs font-medium text-slate-500">Billing</span>
                </div>
              </div>

              {/* Convex & Google Cloud Logos Overlay */}
              <div className="absolute top-[35%] left-[42%] translate-x-[-100%] translate-y-[-100%] z-40 animate-float-slow">
                <div className="glass-card p-2 rounded-xl shadow-soft-card border border-white/50 backdrop-blur-md flex items-center gap-2 group hover:scale-110 transition-transform">
                  <img src="https://static.cdnlogo.com/logos/c/39/convex.svg" alt="Convex" className="w-5 h-5 object-contain" />
                  <span className="text-[10px] font-bold text-slate-800 hidden group-hover:block">Convex</span>
                </div>
              </div>

              <div className="absolute top-[35%] right-[42%] translate-x-[100%] translate-y-[-100%] z-40 animate-float-medium">
                <div className="glass-card p-2 rounded-xl shadow-soft-card border border-white/50 backdrop-blur-md flex items-center gap-2 group hover:scale-110 transition-transform">
                  <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="Google Cloud" className="w-5 h-5 object-contain" />
                  <span className="text-[10px] font-bold text-slate-800 hidden group-hover:block">Google Cloud</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full max-w-4xl justify-between items-center gap-4 px-4 mt-4">
              {[
                { id: 1, label: "Referral", desc: "Doctor creates request" },
                { id: 2, label: "Notification", desc: "Instant alert sent" },
                { id: 3, label: "Verification", desc: "Hub validates data" },
                { id: 4, label: "Acceptance", desc: "Hospital receives pt" }
              ].map((step, idx) => (
                <div key={step.id} className="flex items-center gap-3 w-full sm:w-auto relative group">
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-500 ${currentStep === step.id ? 'bg-primary text-white shadow-glow-primary scale-110' : currentStep > step.id ? 'bg-green-500 text-white shadow-glow-green' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                    {currentStep > step.id ? <span className="material-symbols-outlined text-sm">check</span> : step.id}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${currentStep === step.id ? 'text-primary' : 'text-slate-900'}`}>{step.label}</span>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{step.desc}</span>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 w-16 h-0.5 bg-slate-100 overflow-hidden">
                      <div className={`h-full bg-primary/30 transition-all duration-[4000ms] ease-linear ${currentStep > step.id ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="gradient-orb bg-blue-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Start free. Scale affordably. No hidden fees<br className="hidden md:block" /> — built for Kenyan healthcare realities.
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="text-sm font-semibold text-slate-500">Monthly</span>
              <button className="relative w-14 h-8 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer">
                <span className="sr-only">Toggle billing cycle</span>
                <span className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full shadow transition-transform transform translate-x-6"></span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">Yearly</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Save 35%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Demo */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 relative flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Demo</h3>
                <p className="text-slate-500 text-sm">Free Access</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Max 20 referrals/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Access to 5 hospitals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Up to 5 physicians</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Basic referral & tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">STK payment prompt</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-slate-50 text-primary border border-primary/20 hover:bg-blue-50 hover:border-primary text-slate-900 rounded-xl font-semibold transition-colors cursor-pointer">
                Start Free Demo
              </button>
            </div>

            {/* Tier 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-blue-500/10 transform md:-translate-y-4 relative flex flex-col h-full border-2 border-primary">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary mb-2">Tier 1</h3>
                <p className="text-slate-500 text-sm">For growing clinics</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$50</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700">45 referrals/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700">10 hospitals in network</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700">Access by 10 physicians</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700 font-semibold">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700">Appointment booking & SMS</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-lg mt-0.5">check</span>
                  <span className="text-slate-700">Analytics dashboard</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-primary text-white hover:bg-blue-600 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
                Choose Tier 1
              </button>
            </div>

            {/* Tier 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 relative flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tier 2</h3>
                <p className="text-slate-500 text-sm">Unlimited Scale</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$150</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-grow text-sm">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Unlimited referrals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Unlimited facilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Unlimited physicians</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600 font-semibold">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check</span>
                  <span className="text-slate-600">Advanced analytics & audit logs</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-semibold transition-colors cursor-pointer">
                Select Tier 2
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-light border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              We're actively seeking partners to scale<br className="hidden md:block" /> digital referrals across Kenya.
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Let's build a stronger referral network together.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 flex flex-col items-center text-center group border border-slate-100">
              <div className="w-20 h-20 mb-6 bg-blue-50 rounded-full flex items-center justify-center relative">
                <span className="absolute w-full h-full rounded-full border-2 border-blue-100 animate-ping opacity-75"></span>
                <span className="material-symbols-outlined text-4xl text-primary relative z-10">local_hospital</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Hospitals & Clinics</h3>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                Join as a referring or receiving facility. Improve patient retention and care coordination.
              </p>
              <button className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm cursor-pointer">
                Partner as a Facility
              </button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 flex flex-col items-center text-center group border border-slate-100">
              <div className="w-20 h-20 mb-6 bg-blue-50 rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
                <span className="material-symbols-outlined text-4xl text-primary animate-bounce-gentle relative z-10" style={{ animationDuration: '2s' }}>location_on</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Counties & Government</h3>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                Integrate with county health systems. Gain visibility into regional health data.
              </p>
              <button className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm cursor-pointer">
                Government Partnership
              </button>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-soft-card hover:shadow-soft-hover transition-all duration-300 flex flex-col items-center text-center group border border-slate-100">
              <div className="w-20 h-20 mb-6 bg-blue-50 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
                  <span className="w-2 h-2 bg-blue-300 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></span>
                  <span className="w-2 h-2 bg-blue-300 rounded-full absolute bottom-4 right-2"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full absolute bottom-6 left-3"></span>
                </div>
                <span className="material-symbols-outlined text-4xl text-primary relative z-10">hub</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">NGOs & Tech Partners</h3>
              <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                Co-develop features, integrate APIs, or co-fund rural pilots for better reach.
              </p>
              <button className="w-full py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm cursor-pointer">
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 grayscale opacity-50">
              <svg className="w-full h-full" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35V20H35C35 11.7157 28.2843 5 20 5Z" fill="#22C55E"></path>
                <path d="M20 35C28.2843 35 35 28.2843 35 20H20V35Z" fill="#EF4444"></path>
                <circle cx="20" cy="20" fill="white" r="4"></circle>
              </svg>
            </div>
            <span className="font-bold text-slate-400">UzimaCare © 2026</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

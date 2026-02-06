"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <Image
                src="/logo/logo.png"
                alt="UzimaCare Logo"
                width={200}
                height={80}
                className="h-16 w-auto brightness-0"
                priority
              />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">How it Works</a>
              <a href="#partners" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Partners</a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                  Login Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/50 to-transparent skew-x-12 transform translate-x-20"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 border border-blue-200 text-primary font-semibold text-sm mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Now Live across 47 Counties
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Digital Referrals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                Faster Care. Better Outcomes.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Eliminate paper-based delays. Track referrals in real-time. Ensure continuity of care across Kenyan healthcare facilities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button className="h-14 px-8 text-lg bg-primary hover:bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
                  Get Started Now
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 text-lg border-2 border-gray-200 hover:bg-gray-50 rounded-2xl text-gray-700 transition-all">
                View Documentation
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">Why UzimaCare?</h2>
            <p className="text-4xl font-bold text-gray-900 mb-6">Solving real problems in Kenya's referral system with modern, accessible technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 cursor-default">
            {/* Feature 1 */}
            <div className="group rounded-3xl p-8 bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Faster Referrals</h3>
              <p className="text-gray-600 leading-relaxed">
                Replace paper with instant digital referrals — reduce wait from days to minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl p-8 bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Compliant</h3>
              <p className="text-gray-600 leading-relaxed">
                End-to-end encryption. Compliant with Kenyan health data regulations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl p-8 bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mobile-First</h3>
              <p className="text-gray-600 leading-relaxed">
                Works on any device. STK push payments. USSD fallback for low-connectivity areas.
              </p>
            </div>

            {/* Feature 4 - Optional */}
            <div className="group rounded-3xl p-8 bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                Start with a free pilot. Scale affordably with no hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, secure, and efficient workflow from referral creation to patient arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Physician Refers", desc: "Doctor enters patient details and diagnosis in the portal.", icon: "📝" },
              { step: "2", title: "Admin Books", desc: "Admin reviews referral, adds biodata, and books slot.", icon: "📅" },
              { step: "3", title: "Patient Pays", desc: "Patient receives SMS, pays via M-Pesa STK Push.", icon: "💳" },
              { step: "4", title: "Care Delivered", desc: "Patient arrives, doctor accesses full digital history.", icon: "🏥" }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/40">
                  {item.step}
                </div>
                <div className="text-4xl mb-6 mt-2">{item.icon}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">Simple, Transparent Pricing</h2>
            <p className="text-4xl font-bold text-gray-900 mb-6">Start free. Scale affordably. No hidden fees — built for Kenyan healthcare realities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Demo */}
            <div className="rounded-3xl p-8 bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Demo</h3>
              <p className="text-gray-600 mb-6">Free Access</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li>Max 20 referrals/month</li>
                <li>Access to 5 hospitals</li>
                <li>Up to 5 physicians</li>
                <li>Basic referral & tracking</li>
                <li>STK payment prompt</li>
              </ul>
              <Button className="w-full bg-primary hover:bg-blue-600 text-white">Start Free Demo</Button>
            </div>

            {/* Tier 1 */}
            <div className="rounded-3xl p-8 bg-primary border border-primary hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Tier 1</h3>
              <p className="text-blue-200 mb-6">For growing clinics</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">$50</span>
                <span className="text-blue-200 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-blue-100">
                <li>45 referrals/month</li>
                <li>10 hospitals in network</li>
                <li>Access by 10 physicians</li>
                <li>Priority support</li>
                <li>Appointment booking & SMS</li>
                <li>Analytics dashboard</li>
              </ul>
              <Button className="w-full bg-white text-primary hover:bg-gray-100">Choose Tier 1</Button>
            </div>

            {/* Tier 2 */}
            <div className="rounded-3xl p-8 bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Tier 2</h3>
              <p className="text-gray-600 mb-6">Unlimited Scale</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$150</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li>Unlimited referrals</li>
                <li>Unlimited facilities</li>
                <li>Unlimited physicians</li>
                <li>Custom integrations</li>
                <li>Dedicated account manager</li>
                <li>Advanced analytics & audit logs</li>
              </ul>
              <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-blue-50">Select Tier 2</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section id="partners" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">Partnerships & Collaboration</h2>
            <p className="text-4xl font-bold text-gray-900 mb-6">We're actively seeking partners to scale digital referrals across Kenya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hospitals & Clinics */}
            <div className="rounded-3xl p-8 bg-white border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hospitals & Clinics</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join as a referring or receiving facility. Pilot free for 3 months.
              </p>
              <Button className="w-full bg-primary hover:bg-blue-600 text-white">Partner as a Facility</Button>
            </div>

            {/* Counties & Government */}
            <div className="rounded-3xl p-8 bg-white border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Counties & Government</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Integrate with county health systems. Special pricing and support.
              </p>
              <Button className="w-full bg-primary hover:bg-blue-600 text-white">Government Partnership</Button>
            </div>

            {/* NGOs & Tech Partners */}
            <div className="rounded-3xl p-8 bg-white border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">NGOs & Tech Partners</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Co-develop features, integrate APIs, or co-fund rural pilots.
              </p>
              <Button className="w-full bg-primary hover:bg-blue-600 text-white">Become a Partner</Button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-gray-700 font-medium">Let's build a stronger referral network together.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="UzimaCare Logo"
              width={140}
              height={35}
              className="h-10 w-auto brightness-0"
            />
          </div>
          <p className="text-gray-500 text-xs">
            © 2024 UzimaCare. Built for Kenya. Powered by secure infrastructure.
          </p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

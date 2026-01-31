import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UzimaCare – Digital Healthcare Referrals",
  description: "Streamlining patient referrals between facilities in Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

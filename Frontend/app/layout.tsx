import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Uzimacare - TB Patient Care Management",
  description:
    "Kenya healthcare application for TB patient management, inter-facility referrals, and mobile payments",
  generator: "v0.app",
  icons: {
    icon: "/logo/logo.png",
    apple: "/logo/logo.png",
  },
};


import { ConvexClientProvider } from "@/components/providers/convex-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased min-h-screen bg-background-light text-text-main`}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

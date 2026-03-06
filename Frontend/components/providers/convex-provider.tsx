"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Lazily create the client so the module can be evaluated during SSR/prerender
// even when NEXT_PUBLIC_CONVEX_URL is not yet available.
let convex: ConvexReactClient | null = null;
function getConvexClient() {
    if (!convex) {
        const url = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
        convex = new ConvexReactClient(url);
    }
    return convex;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexAuthProvider client={getConvexClient()}>{children}</ConvexAuthProvider>;
}

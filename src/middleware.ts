/**
 * src/middleware.ts
 * ─────────────────────────────────────────────────────────────
 * Uses the EDGE-SAFE authConfig (no Node.js imports).
 * Protects all app routes — redirects unauthenticated users to /login.
 * ─────────────────────────────────────────────────────────────
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Build a middleware-only NextAuth instance with the edge-safe config
const { auth } = NextAuth(authConfig);

export default auth;

// Routes this middleware applies to
export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/profile",
    "/map/:path*",
    "/route/:path*",
    "/attendance/:path*",
    "/fleet/:path*",
    "/reports/:path*",
    "/bus/:path*",
    "/analytics/:path*",
    "/emergency",
    "/settings",
    "/notifications",
  ],
};

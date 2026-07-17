/**
 * src/middleware.ts
 * ─────────────────────────────────────────────────────────────
 * Edge-compatible NextAuth middleware.
 * Uses the edge-safe authConfig (no Node.js imports).
 *
 * ── Matcher notes ─────────────────────────────────────────────
 *  • Excludes /_next/*, /api/auth/* (NextAuth's own routes),
 *    and static files so they are never processed here.
 *  • /unauthorized is listed so logged-in users CAN reach it
 *    (the authorized callback returns true for all logged-in
 *    requests to non-auth-UI paths).
 *  • No custom redirect logic here — all routing decisions live
 *    in authConfig.callbacks.authorized.
 * ─────────────────────────────────────────────────────────────
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    /*
     * Match every route EXCEPT:
     *  - _next/static (static files)
     *  - _next/image  (image optimisation)
     *  - favicon.ico
     *  - api/auth     (NextAuth's own handler — must be excluded to avoid loops)
     *  - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};

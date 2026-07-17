/**
 * src/auth.config.ts
 * ─────────────────────────────────────────────────────────────
 * EDGE-SAFE config — no Node.js modules (no fs, crypto, bcrypt).
 * Used ONLY by middleware.ts so the Edge runtime can read JWT
 * cookies without importing the full credentials / hashing logic.
 *
 * ── Changes ───────────────────────────────────────────────────
 *  • Explicit `secret` read from AUTH_SECRET (v5 variable name).
 *  • `authorized` callback now distinguishes:
 *      - /login and /signup → redirect logged-in users to their
 *        role dashboard (avoids showing the auth UI to someone
 *        who is already signed in).
 *      - / (root) → always public.
 *      - Every other route → must be authenticated.
 *  • Returns `false` (not `undefined`) for unauthenticated
 *    protected routes — triggers Auth.js to redirect to signIn
 *    page without any infinite-loop risk.
 * ─────────────────────────────────────────────────────────────
 */
import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS   = new Set(["/", "/login", "/signup", "/unauthorized"]);
const AUTH_UI_PATHS  = new Set(["/login", "/signup"]);

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,

  session: { strategy: "jwt" },

  pages: {
    signIn:  "/login",
    newUser: "/signup",
    error:   "/login",      // send /api/auth/error redirects to /login, not an error page
  },

  providers: [], // providers are added in auth.ts (Node.js only)

  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn  = !!session?.user;
      const { pathname } = nextUrl;

      // Always allow public paths without any session check
      if (PUBLIC_PATHS.has(pathname)) {
        // Redirect already-authenticated users away from /login and /signup
        // so they don't see the auth UI when they're already signed in.
        if (isLoggedIn && AUTH_UI_PATHS.has(pathname)) {
          const role =
            (session!.user as { role?: string })?.role ?? "student";
          return Response.redirect(new URL(`/dashboard/${role}`, nextUrl));
        }
        return true;
      }

      // Everything else requires authentication
      if (!isLoggedIn) {
        // Return false — Auth.js will redirect to pages.signIn (/login)
        return false;
      }

      return true;
    },
  },
};

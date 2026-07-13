/**
 * src/auth.config.ts
 * ─────────────────────────────────────────────────────────────
 * EDGE-SAFE auth config — no Node.js modules (no fs, path, etc.)
 * Used ONLY by middleware.ts so the JWT cookie can be read in
 * the Edge runtime without importing the full credentials logic.
 * ─────────────────────────────────────────────────────────────
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [],   // providers are added in auth.ts (Node.js)
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const publicPaths = ["/", "/login", "/signup"];
      const isPublic = publicPaths.includes(nextUrl.pathname);

      if (isPublic) {
        // Redirect logged-in users away from /login and /signup
        if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")) {
          const role = (session?.user as { role?: string })?.role ?? "student";
          return Response.redirect(new URL(`/dashboard/${role}`, nextUrl));
        }
        return true;
      }

      // Protected route — must be logged in
      return isLoggedIn;
    },
  },
};

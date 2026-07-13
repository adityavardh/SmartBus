"use client";

/**
 * src/components/auth/route-guard.tsx
 * ─────────────────────────────────────────────────────────────
 * Client-side guard that mirrors the middleware protection.
 * Uses NextAuth's useSession() — if unauthenticated, redirects
 * to /login. Shows a loading state while the session resolves.
 * ─────────────────────────────────────────────────────────────
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // While NextAuth is checking the session, show a minimal spinner
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-white/10 border-t-accent"
        />
      </div>
    );
  }

  // Not authenticated yet — don't flash protected content
  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}

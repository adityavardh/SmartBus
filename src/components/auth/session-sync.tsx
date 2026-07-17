"use client";

/**
 * src/components/auth/session-sync.tsx
 * ─────────────────────────────────────────────────────────────
 * Syncs the NextAuth session into the Zustand auth store.
 *
 * Why it exists:
 *   Existing pages read user data from useAuthStore() (avatar,
 *   achievements, streak…).  NextAuth is the source of truth for
 *   authentication state; Zustand provides the rich UserProfile.
 *
 * ── Bug fixed ─────────────────────────────────────────────────
 *   The old implementation listed `login` and `logout` (Zustand
 *   actions) in the useEffect dependency array.  In React Strict
 *   Mode / hot-reload, Zustand recreates action references on
 *   every store update, so the effect fired on every single store
 *   change — creating an infinite sync loop.
 *
 *   Fix: read actions via a stable store ref outside the effect.
 *   The effect only depends on NextAuth's `status` and `session`,
 *   which change far less frequently.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/types";

export function SessionSync() {
  const { data: session, status } = useSession();

  // Stable ref to Zustand's store — actions never change identity
  // here because we read them once via getState(), not via a hook.
  const storeRef = useRef(useAuthStore.getState);

  useEffect(() => {
    if (status === "loading") return;

    const { isAuthenticated, role, user, login, logout } = storeRef.current();

    if (status === "authenticated" && session?.user) {
      const nextRole  = (session.user as { role?: UserRole }).role ?? "student";
      const nextEmail = session.user.email ?? "";
      const nextName  = session.user.name  ?? "";

      // Only sync if something actually changed — avoids unnecessary store writes
      if (
        !isAuthenticated ||
        user.email !== nextEmail ||
        role      !== nextRole
      ) {
        login(nextRole, nextEmail, nextName);
      }
      return;
    }

    if (status === "unauthenticated" && isAuthenticated) {
      logout();
    }
  }, [status, session]); // ← only stable NextAuth values in deps

  return null;
}

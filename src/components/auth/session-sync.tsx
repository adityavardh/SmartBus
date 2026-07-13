/**
 * src/components/auth/session-sync.tsx
 * ─────────────────────────────────────────────────────────────
 * Invisible component that syncs the NextAuth session into the
 * existing Zustand auth store.
 *
 * Why: All the existing pages (Profile, Dashboard, etc.) read
 * user data from useAuthStore(). NextAuth is our source of truth
 * for whether someone is logged in; Zustand gives us the rich
 * UserProfile object (avatar, achievements, streak, etc.).
 *
 * When NextAuth says "authenticated" → call Zustand login(role, email)
 * When NextAuth says "unauthenticated" → call Zustand logout()
 * ─────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/types";

export function SessionSync() {
  const { data: session, status } = useSession();
  const { isAuthenticated, login, logout } = useAuthStore();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user) {
      const role = session.user.role as UserRole;
      const email = session.user.email;
      const name = session.user.name;
      const currentStoreUser = useAuthStore.getState().user;
      const currentStoreRole = useAuthStore.getState().role;
      
      // Sync if not authenticated in store, or if email/role does not match NextAuth session
      if (!isAuthenticated || currentStoreUser.email !== email || currentStoreRole !== role) {
        login(role, email, name);
      }
    }

    if (status === "unauthenticated" && isAuthenticated) {
      logout();
    }
  }, [status, session, isAuthenticated, login, logout]);

  return null; // renders nothing — purely for side effects
}

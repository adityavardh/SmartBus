/**
 * parentService.ts
 *
 * Returns the parent profile linked to the current city's child.
 *
 * FUTURE BACKEND: Replace with GET /api/parents/me
 */

import { PARENT_DATABASE } from "@/data/students";
import type { ParentProfile } from "@/types/location";

const FALLBACK_PARENT: ParentProfile = {
  id: "par-fallback",
  name: "Parent",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Parent&backgroundColor=7C3AED",
  childId: "chd-fallback",
  cityId: "hyderabad",
};

function sessionSeed(): number {
  const now = new Date();
  return (
    now.getFullYear() * 1000 +
    Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        86_400_000
    )
  );
}

export function getParentForCity(cityId: string): ParentProfile {
  const pool = PARENT_DATABASE[cityId];
  if (!pool || pool.length === 0) return FALLBACK_PARENT;
  return pool[sessionSeed() % pool.length];
}

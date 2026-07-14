/**
 * driverService.ts
 *
 * Picks a driver for the current session.
 * The pick is deterministic per-session: we seed off the day-of-year so
 * the same driver appears all day but rotates across days.
 *
 * FUTURE BACKEND: Replace with GET /api/drivers/assigned?busId=…
 */

import { DRIVER_DATABASE, FALLBACK_DRIVERS } from "@/data/drivers";
import type { DriverProfile } from "@/types/location";

function sessionSeed(): number {
  // Day-of-year gives a stable index within one calendar day
  const now = new Date();
  return now.getFullYear() * 1000 + (Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      86_400_000
  ));
}

export function getDriverForCity(cityId: string): DriverProfile {
  const pool = DRIVER_DATABASE[cityId] ?? FALLBACK_DRIVERS;
  const idx = sessionSeed() % pool.length;
  return pool[idx];
}

export function getAllDriversForCity(cityId: string): DriverProfile[] {
  return DRIVER_DATABASE[cityId] ?? FALLBACK_DRIVERS;
}

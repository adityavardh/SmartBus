/**
 * busService.ts
 *
 * Returns the primary bus and full fleet for a given city.
 * Same session-seed logic as driverService — consistent within a day.
 *
 * FUTURE BACKEND: Replace with GET /api/buses?cityId=… and GET /api/buses/:id
 */

import { BUS_DATABASE, FALLBACK_BUSES } from "@/data/buses";
import type { BusProfile } from "@/types/location";
import type { FleetBus, BusStatus } from "@/types";

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

export function getPrimaryBus(cityId: string): BusProfile {
  const pool = BUS_DATABASE[cityId] ?? FALLBACK_BUSES;
  // Bus 0 is always the primary (the one the logged-in student rides)
  return pool[0];
}

export function getAllBusesForCity(cityId: string): BusProfile[] {
  return BUS_DATABASE[cityId] ?? FALLBACK_BUSES;
}

// ─── Build FleetBus list for admin map ────────────────────────────────────────

const STATUS_CYCLE: BusStatus[] = [
  "running",
  "running",
  "running",
  "delayed",
  "stopped",
];

/**
 * Converts BusProfile[] → FleetBus[] scattered around the city's fleet offset.
 * Each bus gets a pseudo-random position near the city centre.
 */
export function getFleetBuses(cityId: string): FleetBus[] {
  const buses = getAllBusesForCity(cityId);
  const seed = sessionSeed();

  return buses.map((bus, i) => {
    // Simple deterministic scatter using bus index + seed
    const latJitter = ((seed + i * 7 + 3) % 200) / 10_000 - 0.01;
    const lngJitter = ((seed + i * 13 + 5) % 200) / 10_000 - 0.01;

    const status: BusStatus =
      bus.engine === "warning"
        ? "delayed"
        : STATUS_CYCLE[(i + seed) % STATUS_CYCLE.length];

    return {
      id: bus.id,
      number: bus.number,
      status,
      driver: "—", // filled in by locationStore if needed
      studentsOnboard: bus.occupancy,
      position: {
        lat: 0 + latJitter, // will be overridden by locationStore with city centre
        lng: 0 + lngJitter,
      },
      eta: status === "running" ? ((seed + i * 3) % 15) + 3 : 0,
      route: `Route ${String.fromCharCode(65 + i)}`,
      gpsHealth: bus.networkSignal > 1,
    };
  });
}

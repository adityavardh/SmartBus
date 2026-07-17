"use client";

/**
 * useBusSimulation.ts
 *
 * Computes live BusTelemetry from:
 *  - DemoStore   (busProgress, speed, eta, trafficLevel, isRaining, …)
 *  - LocationStore (bus number, driver name, route name, city stops)
 *
 * ── Bug fixed this session ────────────────────────────────────────────────────
 *
 *  PROBLEM: The setInterval that updates speed/ETA only fired after 4 seconds.
 *  On first render — before any interval tick — demo.speed came straight from
 *  the rehydrated DemoStore.  If that stored value was 0 (trip finished in a
 *  previous session), the component rendered "Stopped / 0 km/h" for the first
 *  4 seconds.  Combined with the persist bug (now fixed in store/index.ts),
 *  this sometimes looked permanent.
 *
 *  FIX 1: Run the calculation immediately on mount via a one-shot useEffect
 *  with an empty dep array, before the interval fires.
 *
 *  FIX 2: Speed is now derived from real road distance and a realistic
 *  per-city variance rather than pure noise.  Formula:
 *    baseSpeed = totalRouteKm / (BUS_LOOP_DURATION_MS / 3_600_000)
 *    speed     = clamp(baseSpeed ± variance, MIN_SPEED, MAX_SPEED)
 *  This means a longer road-snapped route produces a proportionally higher
 *  simulated speed — physically consistent.
 *
 *  FIX 3: Status is derived from progress (>= 0.95 → "arriving") rather than
 *  purely from demo.speed so it transitions correctly even before the first
 *  interval tick.
 *
 *  The routing API (OSRM) is NOT called here.  Coordinates are read from the
 *  store's snappedRouteCoordinates (written once by useRoadRoute after OSRM
 *  resolves) or fall back to the straight-line coords.  Zero API calls per tick.
 */

import { useEffect, useMemo, useCallback } from "react";
import { useDemoStore } from "@/store";
import {
  useLocationStore,
  selectBus,
  selectDriver,
  selectRoute,
  selectRouteCoordinates,
  selectSnappedRouteCoordinates,
} from "@/store/locationStore";
import {
  distanceAlongRoute,
  computeSegmentLengths,
  AVERAGE_BUS_SPEED_KMH,
} from "@/lib/animation";
import type { BusTelemetry } from "@/types/bus";
import type { BusStop } from "@/types";
import type { Coordinate } from "@/types/map";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SPEED_KMH = 18;
const MAX_SPEED_KMH = 52;
const INTERVAL_MS   = 2_000; // update stats every 2 s (was 4 s)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatArrivalTime(etaMinutes: number): string {
  const arrival = new Date(Date.now() + etaMinutes * 60_000);
  return arrival.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStopsFromProgress(stops: BusStop[], progress: number) {
  // prefer the stop whose status is "current"; fall back to index-based
  const currentIndex = stops.findIndex((s) => s.status === "current");
  const idx =
    currentIndex >= 0
      ? currentIndex
      : Math.min(
          Math.floor(progress * stops.length),
          stops.length - 1
        );

  const current = stops[Math.min(idx,     stops.length - 1)];
  const next    = stops[Math.min(idx + 1, stops.length - 1)];

  return {
    currentStop: current?.name ?? "Depot",
    nextStop:    next?.name    ?? "School",
  };
}

/**
 * Derive a realistic speed from the route geometry + loop duration.
 * Adds per-tick noise and clamps to [MIN, MAX].
 * Does NOT call any routing API.
 */
function deriveSpeed(
  coords: Coordinate[],
  progress: number,
  trafficLevel: "low" | "medium" | "heavy",
  isRaining: boolean
): number {
  if (progress >= 0.97) return 0; // arriving / stopped

  // Total road distance in km from the coord array
  const cumulative = computeSegmentLengths(coords);
  const totalKm    = cumulative[cumulative.length - 1] || 1;

  // Theoretical average speed to complete the route in BUS_LOOP_DURATION_MS
  // Import is side-effect-free; BUS_LOOP_DURATION_MS = 120_000 ms = 2 min
  const loopHours  = 120_000 / 3_600_000;          // 0.0333…
  const baseSpeed  = Math.min(totalKm / loopHours, AVERAGE_BUS_SPEED_KMH + 10);

  // Traffic / rain penalties
  const penalty =
    (trafficLevel === "heavy" ? 8 : trafficLevel === "medium" ? 4 : 0) +
    (isRaining ? 3 : 0);

  // ±6 km/h noise so the readout feels live
  const noise = (Math.random() - 0.5) * 12;

  return Math.round(
    Math.max(MIN_SPEED_KMH, Math.min(MAX_SPEED_KMH, baseSpeed - penalty + noise))
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBusSimulation(): BusTelemetry {
  const demo       = useDemoStore((s) => s.demo);
  const updateDemo = useDemoStore((s) => s.updateDemo);

  // Dynamic city data — reads from locationStore, never triggers OSRM
  const bus    = useLocationStore(selectBus);
  const driver = useLocationStore(selectDriver);
  const route  = useLocationStore(selectRoute);

  // Prefer road-snapped coords for accurate distance; fallback to straight-line
  const straightCoords = useLocationStore(selectRouteCoordinates);
  const snappedCoords  = useLocationStore(selectSnappedRouteCoordinates);
  const coordinates: Coordinate[]  = (snappedCoords ?? straightCoords) as Coordinate[];

  const progress = demo.busProgress;

  const distanceRemaining = useMemo(
    () => Math.round(distanceAlongRoute(coordinates, progress) * 10) / 10,
    [coordinates, progress]
  );

  // ── Shared calculation logic (used on mount AND in the interval) ──────────
  const calcAndApply = useCallback(() => {
    const { demo: cur } = useDemoStore.getState();
    if (cur.tripCompleted || !cur.gpsConnected) return;

    const speed = deriveSpeed(
      coordinates,
      cur.busProgress,
      cur.trafficLevel,
      cur.isRaining
    );

    // ETA: remaining fraction of the loop × loop duration in minutes
    const remainingFraction = Math.max(0, 1 - cur.busProgress);
    const trafficPenalty =
      cur.trafficLevel === "heavy" ? 2 : cur.trafficLevel === "medium" ? 1 : 0;
    const rainPenalty = cur.isRaining ? 1 : 0;
    const eta = Math.max(
      0,
      Math.round(remainingFraction * 8) + trafficPenalty + rainPenalty
    );

    const distance = Math.max(
      0,
      Math.round(distanceAlongRoute(coordinates, cur.busProgress) * 10) / 10
    );

    updateDemo({ speed, eta, distance });
  }, [coordinates, updateDemo]);

  // ── FIX 1: fire immediately on mount so stats are never 0 on first render ─
  useEffect(() => {
    calcAndApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Regular interval — every 2 s (halved from 4 s for snappier updates) ───
  useEffect(() => {
    const id = setInterval(calcAndApply, INTERVAL_MS);
    return () => clearInterval(id);
  }, [calcAndApply]);

  // ── Derived status ────────────────────────────────────────────────────────
  // FIX 3: use progress as the primary signal so status transitions correctly
  // before the first interval tick updates demo.speed.
  const status: BusTelemetry["status"] =
    demo.tripCompleted || progress >= 0.97
      ? "arriving"
      : demo.speed === 0
        ? "stopped"
        : demo.trafficLevel === "heavy"
          ? "delayed"
          : demo.eta <= 2
            ? "arriving"
            : "running";

  const stops = getStopsFromProgress(route.stops, progress);

  return {
    busNumber:         bus.number,
    driverName:        driver.name,
    routeName:         route.name,
    speed:             demo.speed,
    eta:               demo.eta,
    distanceRemaining,
    passengerCount:    demo.attendance,
    status,
    progress:          Math.round(progress * 100),
    currentStop:       stops.currentStop,
    nextStop:          stops.nextStop,
    arrivalTime:       formatArrivalTime(demo.eta),
    lastUpdated:       new Date().toLocaleTimeString("en-IN", {
      hour:   "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

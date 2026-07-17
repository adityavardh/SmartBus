"use client";

/**
 * useBusAnimation.ts
 *
 * Drives the bus marker position by interpolating along the route geometry
 * using requestAnimationFrame at ~60 fps.
 *
 * ── Bugs fixed in previous sessions ──────────────────────────────────────────
 *
 *  BUG-A (stale closure): useEffect reset startRef using a stale captured
 *  `position.progress` value every time `coordinates` changed.
 *  Fix: progressRef always mirrors the latest progress — startRef reads from
 *  it instead of the closure.
 *
 *  BUG-B (identity churn): OSRM returning a new array reference (even with
 *  identical values) caused tick to recreate and the RAF to restart.
 *  Fix: coordsRef + coordsEqual() — tick never has coordinates in its deps.
 *
 * ── Bug fixed this session ────────────────────────────────────────────────────
 *
 *  BUG-C (stale persisted state → frozen marker):
 *  Zustand `persist` was writing busProgress / speed / tripCompleted to
 *  localStorage.  A session that ended with tripCompleted:true or speed:0
 *  rehydrated with those values on the next page load.  The RAF loop would
 *  start but the DemoStore immediately showed "Stopped" / 0 km/h because the
 *  persisted tripCompleted:true short-circuited both the animation and the
 *  simulation interval.
 *
 *  Fix (this file): call resetSimulation() exactly once on mount.  This clears
 *  busProgress / tripCompleted / gpsConnected back to DEFAULT_DEMO values
 *  *before* the RAF starts, so the bus always begins a fresh run from the
 *  correct start progress.  The store fix (partialize in store/index.ts)
 *  prevents the volatile fields from being persisted in the first place, so
 *  this becomes a belt-and-suspenders safety net.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  interpolateAlongLine,
  BUS_LOOP_DURATION_MS,
} from "@/lib/animation";
import { useRoute } from "@/hooks/useRoute";
import { useDemoStore } from "@/store";
import type { BusPosition, Coordinate } from "@/types/map";
import { DEFAULT_DEMO } from "@/data/mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when two coordinate arrays are value-equal (same length + values). */
function coordsEqual(a: Coordinate[], b: Coordinate[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) return false;
  }
  return true;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseBusAnimationOptions {
  enabled?: boolean;
  loop?: boolean;
  /**
   * Optional coordinate override — pass the road-snapped array from
   * useRoadRoute() so the bus marker rides the real road geometry.
   * Omit (or pass undefined) to fall back to the store's straight-line coords.
   */
  coordinates?: Coordinate[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBusAnimation(options: UseBusAnimationOptions = {}) {
  const { enabled = true, loop = true, coordinates: coordsOverride } = options;

  // Fallback: straight-line coordinates from the location store
  const { coordinates: storeCoords } = useRoute();
  const resolvedCoords =
    coordsOverride && coordsOverride.length > 1 ? coordsOverride : storeCoords;

  const updateDemo     = useDemoStore((s) => s.updateDemo);
  const resetSim       = useDemoStore((s) => s.resetSimulation);
  const demoEnabled    = useDemoStore((s) => s.demo.enabled);
  const tripCompleted  = useDemoStore((s) => s.demo.tripCompleted);
  const gpsConnected   = useDemoStore((s) => s.demo.gpsConnected);

  // ── BUG-C fix: reset stale persisted sim state on first mount ─────────────
  // This runs exactly once (empty dep array).  It resets busProgress / speed /
  // tripCompleted to DEFAULT_DEMO values so the RAF starts from a known-good
  // state regardless of what localStorage had.
  useEffect(() => {
    resetSim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── BUG-B fix: stable coordinates ref ────────────────────────────────────
  const coordsRef = useRef<Coordinate[]>(resolvedCoords);
  if (!coordsEqual(coordsRef.current, resolvedCoords)) {
    coordsRef.current = resolvedCoords;
  }

  // ── Initial position at DEFAULT_DEMO.busProgress (always fresh) ──────────
  const [position, setPosition] = useState<BusPosition>(() => {
    const initial = interpolateAlongLine(
      coordsRef.current,
      DEFAULT_DEMO.busProgress
    );
    return { ...initial, progress: DEFAULT_DEMO.busProgress };
  });

  // ── BUG-A fix: progress ref — always mirrors latest progress ─────────────
  const progressRef     = useRef<number>(DEFAULT_DEMO.busProgress);
  const rafRef          = useRef<number>(0);
  const startRef        = useRef<number>(0);
  const lastDemoSyncRef = useRef<number>(0);

  const shouldAnimate =
    enabled &&
    coordsRef.current.length > 1 &&
    (!demoEnabled || (!tripCompleted && gpsConnected));

  // tick reads coords and progress exclusively from refs — zero stale closures
  const tick = useCallback(
    (now: number) => {
      if (!startRef.current) startRef.current = now;

      const elapsed = now - startRef.current;
      const progress = loop
        ? (elapsed % BUS_LOOP_DURATION_MS) / BUS_LOOP_DURATION_MS
        : Math.min(elapsed / BUS_LOOP_DURATION_MS, 1);

      const next = interpolateAlongLine(coordsRef.current, progress);
      const newPos = { ...next, progress };

      setPosition(newPos);
      progressRef.current = progress;

      // Sync to DemoStore at most every 500 ms so downstream hooks (
      // useBusSimulation, RouteLayer) don't re-render on every RAF frame.
      if (now - lastDemoSyncRef.current > 500) {
        lastDemoSyncRef.current = now;
        updateDemo({ busProgress: progress });
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [loop, updateDemo]
  );

  useEffect(() => {
    if (!shouldAnimate) return;

    // Use progressRef.current (always the latest value, never stale) so
    // startRef is correct even when the effect re-runs after OSRM resolves.
    startRef.current =
      performance.now() - progressRef.current * BUS_LOOP_DURATION_MS;

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shouldAnimate, tick]);

  return position;
}

"use client";

/**
 * useRoadRoute.ts
 *
 * Fetches a road-snapped route from OSRM for the current city's waypoints.
 *
 * ── Design ────────────────────────────────────────────────────────────────────
 * • Accepts the straight-line waypoints from locationStore as input.
 * • Returns road-snapped coordinates the moment OSRM responds.
 * • Until OSRM resolves, returns the straight-line coordinates as a fallback
 *   so the map always shows something immediately on page load.
 * • Fires a new request ONLY when the waypoint list changes (i.e. when the
 *   city changes).  Within a session the cache hits immediately (zero network).
 * • Uses an AbortController to cancel any in-flight request if the city
 *   switches before the previous fetch completes.
 * • 300 ms debounce prevents rapid city changes (e.g. fast typing in a demo
 *   selector) from firing back-to-back requests.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *   const { coordinates, isSnapped, isLoading, error } = useRoadRoute();
 *   // coordinates is always a usable Coordinate[] — road-snapped when ready,
 *   // straight-line otherwise.  Drop it directly into <RouteLayer>.
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { fetchRoadRoute } from "@/services/osrmService";
import {
  useLocationStore,
  selectRouteCoordinates,
  selectRouteBounds,
} from "@/store/locationStore";
import type { Coordinate, MapBounds } from "@/types/map";
import { computeRouteBounds } from "@/services/routingService";
const DEBOUNCE_MS = 300;

export interface RoadRouteState {
  /** Road-snapped coordinates when available, straight-line fallback otherwise */
  coordinates: Coordinate[];
  /** Bounding box that tightly fits the current coordinates */
  bounds: MapBounds;
  /** true once OSRM has responded with a road-snapped geometry */
  isSnapped: boolean;
  /** true while a network request is in flight */
  isLoading: boolean;
  /** Non-null if OSRM failed (fallback straight-line coordinates are still returned) */
  error: string | null;
}

export function useRoadRoute(): RoadRouteState {
  // Straight-line waypoints from the store (the stop lat/lng list)
  const straightCoords = useLocationStore(selectRouteCoordinates);
  const straightBounds = useLocationStore(selectRouteBounds);
  const setSnappedRouteCoordinates = useLocationStore((s) => s.setSnappedRouteCoordinates);

  const [snappedCoords, setSnappedCoords] = useState<Coordinate[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the waypoints we last successfully fetched so we skip unchanged sets
  const lastFetchedKey = useRef<string>("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortCtrl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (straightCoords.length < 2) return;

    // Stable cache key — same logic as osrmService.cacheKey()
    const key = straightCoords
      .map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`)
      .join("|");

    // Skip if we already have the snapped result for this exact waypoint set
    if (key === lastFetchedKey.current && snappedCoords !== null) return;

    // Clear previous debounce
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      // Cancel any previous in-flight request
      abortCtrl.current?.abort();
      abortCtrl.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchRoadRoute(
          straightCoords,
          abortCtrl.current.signal
        );
        lastFetchedKey.current = key;
        setSnappedCoords(result.coordinates);
        // Write back to store so useBusSimulation can use accurate distances
        setSnappedRouteCoordinates(result.coordinates);
      } catch (err) {
        // AbortError means a newer request superseded this one — not a real error
        if (err instanceof Error && err.name === "AbortError") return;

        const msg =
          err instanceof Error ? err.message : "Road-snapping failed";
        console.warn("[useRoadRoute] OSRM fetch failed, using straight-line fallback:", msg);
        setError(msg);
        // Keep snappedCoords as null → caller falls back to straight-line
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // straightCoords reference changes whenever the city changes in the store
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [straightCoords]);

  // Always abort on unmount
  useEffect(() => {
    return () => {
      abortCtrl.current?.abort();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const activeCoords = snappedCoords ?? straightCoords;

  // ── Memoized bounds ───────────────────────────────────────────────────────
  // computeRouteBounds() produces a plain object literal every call, so its
  // reference always changes even when the values are identical.  That caused
  // the useEffect([bounds]) in BusMap to call fitBounds() on every RouteLayer
  // re-render (which happens every 500 ms when busProgress updates).
  // useMemo with a stringified key ensures the reference is stable — it only
  // changes when the coordinate *values* actually change (i.e. OSRM resolved
  // or the city changed), never on intermediate renders.
  const coordsKey = activeCoords
    .map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`)
    .join("|");

  const activeBounds = useMemo(
    () =>
      snappedCoords
        ? computeRouteBounds(snappedCoords)
        : straightBounds,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coordsKey]
  );

  return {
    coordinates: activeCoords,
    bounds: activeBounds,
    isSnapped: snappedCoords !== null,
    isLoading,
    error,
  };
}

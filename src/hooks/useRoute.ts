/**
 * useRoute
 *
 * Provides the current city's route coordinates + bounds to map components.
 * Replaces the old static BUS_ROUTE_GEOJSON import.
 *
 * FUTURE BACKEND: When locationStore fetches from an API, this hook
 * stays identical — zero UI changes needed.
 */

"use client";

import {
  useLocationStore,
  selectRouteCoordinates,
  selectRouteBounds,
} from "@/store/locationStore";
import type { Coordinate } from "@/types/map";

export function useRoute() {
  const coordinates = useLocationStore(selectRouteCoordinates);
  const bounds = useLocationStore(selectRouteBounds);

  return { coordinates, bounds };
}

// ─── Utility: find where a stop sits along the route (0–1 progress) ──────────

export function getStopProgressOnRoute(
  coordinates: Coordinate[],
  stopLng: number,
  stopLat: number
): number {
  let closestIndex = 0;
  let minDist = Infinity;

  for (let i = 0; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    const dist = (lng - stopLng) ** 2 + (lat - stopLat) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closestIndex = i;
    }
  }

  return closestIndex / Math.max(coordinates.length - 1, 1);
}

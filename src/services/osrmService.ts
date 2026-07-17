/**
 * osrmService.ts
 *
 * Fetches a road-snapped route from the public OSRM demo server.
 *
 * ── Why OSRM? ────────────────────────────────────────────────────────────────
 * • 100 % free, no API key required.
 * • Uses OpenStreetMap road data, so it works for every city in our database.
 * • The public demo server (router.project-osrm.org) is fine for development
 *   and low-traffic production.  For high traffic, self-host via Docker:
 *   https://hub.docker.com/r/osrm/osrm-backend
 *
 * ── Caching & debouncing ─────────────────────────────────────────────────────
 * • Results are stored in a module-level Map keyed by the serialised waypoint
 *   list.  The same route is never fetched twice in the same browser session.
 * • fetchRoadRoute() is safe to call on every render — it returns the cached
 *   value instantly when the waypoints haven't changed.
 * • A 300 ms leading-edge debounce is applied at the hook level (useRoadRoute)
 *   so rapid city switches don't fire multiple requests.
 *
 * ── Response shape (OSRM Route v1) ───────────────────────────────────────────
 * {
 *   code: "Ok",
 *   routes: [{
 *     geometry: { type: "LineString", coordinates: [[lng,lat], ...] },
 *     legs: [...],
 *     duration: number,   // seconds
 *     distance: number    // metres
 *   }]
 * }
 *
 * FUTURE BACKEND: swap the fetch URL to your own routing proxy without
 * changing any hook or component code.
 */

import type { Coordinate } from "@/types/map";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoadRouteResult {
  /** Road-snapped [lng, lat] coordinates — ready to drop into MapRoute */
  coordinates: Coordinate[];
  /** Total route distance in km */
  distanceKm: number;
  /** Estimated travel time in minutes */
  durationMin: number;
}

interface OsrmRoute {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
  message?: string;
}

// ─── Module-level cache (persists for the browser session) ────────────────────

const routeCache = new Map<string, RoadRouteResult>();

// ─── Config ───────────────────────────────────────────────────────────────────

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

/** Maximum number of waypoints sent to OSRM in a single request.
 *  OSRM's public demo server allows up to 100.  We cap at 25 to keep
 *  URLs short and latency low — intermediate waypoints are sub-sampled
 *  if the stop list is longer. */
const MAX_WAYPOINTS = 25;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stable string key for a coordinate list (used for cache lookup). */
function cacheKey(waypoints: Coordinate[]): string {
  return waypoints.map(([lng, lat]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join("|");
}

/**
 * Sub-sample an array to at most `max` elements while always keeping
 * the first and last entry.  Intermediate points are evenly spaced.
 */
function subsample(coords: Coordinate[], max: number): Coordinate[] {
  if (coords.length <= max) return coords;
  const result: Coordinate[] = [coords[0]];
  const step = (coords.length - 2) / (max - 2);
  for (let i = 1; i < max - 1; i++) {
    result.push(coords[Math.round(i * step)]);
  }
  result.push(coords[coords.length - 1]);
  return result;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch a road-snapped route between all supplied waypoints.
 *
 * @param waypoints  [lng, lat] coordinate pairs — typically the list of bus
 *                   stop coordinates in order (depot → stops → school).
 * @param signal     Optional AbortSignal so callers can cancel stale requests.
 */
export async function fetchRoadRoute(
  waypoints: Coordinate[],
  signal?: AbortSignal
): Promise<RoadRouteResult> {
  if (waypoints.length < 2) {
    throw new Error("fetchRoadRoute requires at least 2 waypoints");
  }

  const key = cacheKey(waypoints);

  // Return cached result immediately — no network round-trip
  const cached = routeCache.get(key);
  if (cached) return cached;

  // Sub-sample if needed to stay within OSRM URL limits
  const pts = subsample(waypoints, MAX_WAYPOINTS);

  // OSRM coordinate string: "lng,lat;lng,lat;..."
  const coordStr = pts.map(([lng, lat]) => `${lng},${lat}`).join(";");

  const url =
    `${OSRM_BASE}/${coordStr}` +
    `?overview=full` +        // full geometry (not simplified)
    `&geometries=geojson` +   // GeoJSON LineString in response
    `&steps=false`;           // we only need the overview geometry

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`OSRM HTTP ${res.status}: ${res.statusText}`);
  }

  const data: OsrmResponse = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(`OSRM error: ${data.code} — ${data.message ?? "no routes returned"}`);
  }

  const route = data.routes[0];
  const result: RoadRouteResult = {
    coordinates: route.geometry.coordinates as Coordinate[],
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMin: Math.round(route.duration / 60),
  };

  routeCache.set(key, result);
  return result;
}

/** Clear the in-memory route cache (useful for testing). */
export function clearRouteCache(): void {
  routeCache.clear();
}

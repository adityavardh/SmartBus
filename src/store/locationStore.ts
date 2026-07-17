/**
 * locationStore.ts
 *
 * Single source of truth for the detected city + all derived session data.
 *
 * Flow:
 *   1. App mounts → initLocation() is called once (idempotent)
 *   2. detectCity() runs the geolocation pipeline
 *   3. All services resolve their data for that cityId
 *   4. Every component reads from this store — no prop-drilling
 *
 * FUTURE BACKEND: Replace the service calls inside initLocation()
 * with API calls; the store interface stays identical.
 */

"use client";

import { create } from "zustand";
import { CITY_DATABASE, DEFAULT_CITY_ID } from "@/data/cities";
import { detectCity } from "@/services/locationService";
import { clearRouteCache } from "@/services/osrmService";
import { getSchoolForRoute } from "@/services/schoolService";
import { getDriverForCity, getAllDriversForCity } from "@/services/driverService";
import { getPrimaryBus, getAllBusesForCity, getFleetBuses } from "@/services/busService";
import { getStudentForCity, getChildForCity } from "@/services/studentService";
import { getParentForCity } from "@/services/parentService";
import { routeToCoordinates, routeToGeoJSON, computeRouteBounds } from "@/services/routingService";
import type {
  CityData,
  SchoolData,
  CityRouteData,
  DriverProfile,
  BusProfile,
  StudentProfile,
  ChildProfile,
  ParentProfile,
  UserLocation,
  LocationPermission,
} from "@/types/location";
import type { Coordinate, MapBounds } from "@/types/map";
import type { Feature, LineString } from "geojson";
import type { FleetBus } from "@/types";

// ─── State shape ──────────────────────────────────────────────────────────────

interface LocationState {
  // Initialisation
  isReady: boolean;
  isLoading: boolean;
  error: string | null;

  // Detected location
  userLocation: UserLocation;
  locationPermission: LocationPermission;

  // City context
  cityId: string;
  city: CityData;
  cityLabel: string;

  // Route / map
  route: CityRouteData;
  school: SchoolData;
  /** Straight-line waypoints derived from the city route definition.
   *  Always available immediately — used as the fallback until OSRM resolves. */
  routeCoordinates: Coordinate[];
  routeBounds: MapBounds;
  routeGeoJSON: Feature<LineString>;

  /** Road-snapped coordinates written back by useRoadRoute once OSRM resolves.
   *  null until the first successful fetch for the current city.
   *  useBusSimulation uses these for accurate distance calculations once available. */
  snappedRouteCoordinates: Coordinate[] | null;

  // Entities
  driver: DriverProfile;
  bus: BusProfile;
  student: StudentProfile;
  child: ChildProfile;
  parent: ParentProfile;

  // Fleet (admin)
  fleetBuses: FleetBus[];

  // Actions
  initLocation: () => Promise<void>;
  setUserLocation: (loc: UserLocation) => void;
  /** Called by useRoadRoute once OSRM returns a road-snapped geometry. */
  setSnappedRouteCoordinates: (coords: Coordinate[]) => void;
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

function buildStateForCity(cityId: string, _userLocation: UserLocation) {
  void _userLocation; // reserved for future per-user proximity logic
  const city = CITY_DATABASE[cityId] ?? CITY_DATABASE[DEFAULT_CITY_ID];

  // Pick the first route in the city by default
  const route = city.routes[0];
  const school = getSchoolForRoute(route);

  const driver = getDriverForCity(cityId);
  const bus = getPrimaryBus(cityId);
  const student = getStudentForCity(cityId);
  const child = getChildForCity(cityId);
  const parent = getParentForCity(cityId);

  const routeCoordinates = routeToCoordinates(route);
  const routeBounds = computeRouteBounds(routeCoordinates);
  const routeGeoJSON = routeToGeoJSON(route, school);

  // Build fleet buses scattered around city centre
  const allBuses = getAllBusesForCity(cityId);
  const allDrivers = getAllDriversForCity(cityId);
  const rawFleet = getFleetBuses(cityId);

  const fleetBuses: FleetBus[] = rawFleet.map((fb, i) => {
    const latJitter = ((i * 17 + 3) % 200) / 10_000 - 0.01;
    const lngJitter = ((i * 23 + 7) % 200) / 10_000 - 0.01;
    return {
      ...fb,
      driver: allDrivers[i % allDrivers.length]?.name ?? "—",
      studentsOnboard: allBuses[i]?.occupancy ?? fb.studentsOnboard,
      position: {
        lat: city.center.lat + latJitter,
        lng: city.center.lng + lngJitter,
      },
    };
  });

  return {
    city,
    cityId: city.id,
    cityLabel: city.name,
    route,
    school,
    driver,
    bus,
    student,
    child,
    parent,
    routeCoordinates,
    routeBounds,
    routeGeoJSON,
    fleetBuses,
  };
}

// ─── Default (Hyderabad fallback) ─────────────────────────────────────────────

const DEFAULT_USER_LOCATION: UserLocation = {
  lat: CITY_DATABASE[DEFAULT_CITY_ID].center.lat,
  lng: CITY_DATABASE[DEFAULT_CITY_ID].center.lng,
};

const defaultCityState = buildStateForCity(DEFAULT_CITY_ID, DEFAULT_USER_LOCATION);

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLocationStore = create<LocationState>((set, get) => ({
  isReady: false,
  isLoading: false,
  error: null,

  userLocation: DEFAULT_USER_LOCATION,
  locationPermission: "unknown",

  ...defaultCityState,

  // Road-snapped coordinates start null; populated by useRoadRoute
  snappedRouteCoordinates: null,

  // ── initLocation ──────────────────────────────────────────────────────────
  initLocation: async () => {
    // Idempotent — only run once per session
    if (get().isReady || get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const result = await detectCity();

      const cityState = buildStateForCity(result.cityId, result.userLocation);

      set({
        isReady: true,
        isLoading: false,
        userLocation: result.userLocation,
        locationPermission: result.permission,
        // Clear snapped coords AND the OSRM module cache so the corrected
        // path waypoints are re-fetched for the new city.
        snappedRouteCoordinates: null,
        ...cityState,
      });
      // Flush OSRM cache after state is set so useRoadRoute re-fetches
      clearRouteCache();
    } catch (err) {
      // Graceful fallback — use default city but mark as ready
      set({
        isReady: true,
        isLoading: false,
        error: err instanceof Error ? err.message : "Location detection failed",
      });
    }
  },

  // ── setUserLocation ───────────────────────────────────────────────────────
  setUserLocation: (loc: UserLocation) => {
    set({ userLocation: loc });
  },

  // ── setSnappedRouteCoordinates ────────────────────────────────────────────
  // Called by useRoadRoute once OSRM resolves for the current city.
  // useBusSimulation will use these for more accurate distance calculations.
  setSnappedRouteCoordinates: (coords: Coordinate[]) => {
    set({ snappedRouteCoordinates: coords });
  },
}));

// ─── Convenience selectors ────────────────────────────────────────────────────

export const selectCityLabel            = (s: LocationState) => s.cityLabel;
export const selectRoute                = (s: LocationState) => s.route;
export const selectSchool               = (s: LocationState) => s.school;
export const selectDriver               = (s: LocationState) => s.driver;
export const selectBus                  = (s: LocationState) => s.bus;
export const selectStudent              = (s: LocationState) => s.student;
export const selectChild                = (s: LocationState) => s.child;
export const selectParent               = (s: LocationState) => s.parent;
export const selectFleetBuses           = (s: LocationState) => s.fleetBuses;
export const selectRouteCoordinates     = (s: LocationState) => s.routeCoordinates;
export const selectRouteBounds          = (s: LocationState) => s.routeBounds;
export const selectUserLocation         = (s: LocationState) => s.userLocation;
/** Road-snapped coordinates — null until useRoadRoute writes them back */
export const selectSnappedRouteCoordinates = (s: LocationState) => s.snappedRouteCoordinates;

/**
 * Derives AdminStats from the city's actual fleet — no hardcoded numbers.
 *
 * Counts are computed from fleetBuses (real bus pool) so they automatically
 * reflect whichever city the user is in.  Revenue and complaint counts are
 * lightly seeded from the city id so they look realistic but vary per city.
 */
export const selectAdminStats = (s: LocationState): import("@/types").AdminStats => {
  const buses = s.fleetBuses;

  const totalBuses      = buses.length;
  const runningBuses    = buses.filter((b) => b.status === "running").length;
  const delayedBuses    = buses.filter((b) => b.status === "delayed").length;
  const offlineBuses    = buses.filter((b) => !b.gpsHealth).length;
  const studentsOnboard = buses.reduce((sum, b) => sum + b.studentsOnboard, 0);

  // Derive a stable per-city seed for the "noisy" fields so numbers look
  // realistic and don't change on every render, but differ across cities.
  const seed = s.cityId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const totalStudents   = totalBuses * 40 + (seed % 80);
  const totalDrivers    = totalBuses;
  const activeDrivers   = runningBuses + delayedBuses;
  const gpsHealthPct    = offlineBuses === 0 ? 100 : Math.round(((totalBuses - offlineBuses) / totalBuses) * 100);
  const routeHealthPct  = delayedBuses === 0 ? 98  : Math.round(((totalBuses - delayedBuses) / totalBuses) * 100);
  const revenue         = 180_000 + (seed % 80_000);
  const openComplaints  = (seed % 5) + 1;

  return {
    totalBuses,
    runningBuses,
    delayedBuses,
    offlineBuses,
    totalStudents,
    studentsOnboard,
    totalDrivers,
    activeDrivers,
    revenueThisMonth: revenue,
    gpsHealthPercent: gpsHealthPct,
    openComplaints,
    routeHealthPercent: routeHealthPct,
  };
};

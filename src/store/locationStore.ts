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
  routeCoordinates: Coordinate[];
  routeBounds: MapBounds;
  routeGeoJSON: Feature<LineString>;

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
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

function buildStateForCity(cityId: string, _userLocation: UserLocation) {
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
        ...cityState,
      });
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
}));

// ─── Convenience selectors ────────────────────────────────────────────────────

export const selectCityLabel = (s: LocationState) => s.cityLabel;
export const selectRoute = (s: LocationState) => s.route;
export const selectSchool = (s: LocationState) => s.school;
export const selectDriver = (s: LocationState) => s.driver;
export const selectBus = (s: LocationState) => s.bus;
export const selectStudent = (s: LocationState) => s.student;
export const selectChild = (s: LocationState) => s.child;
export const selectParent = (s: LocationState) => s.parent;
export const selectFleetBuses = (s: LocationState) => s.fleetBuses;
export const selectRouteCoordinates = (s: LocationState) => s.routeCoordinates;
export const selectRouteBounds = (s: LocationState) => s.routeBounds;
export const selectUserLocation = (s: LocationState) => s.userLocation;

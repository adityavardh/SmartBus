/**
 * Location-aware type definitions.
 * All city/school/driver/bus data uses these types.
 */

import type { BusStop, LatLng } from "@/types";

// ─── City ─────────────────────────────────────────────────────────────────────

export interface CityRouteData {
  id: string;
  name: string;
  schoolId: string;
  stops: BusStop[];
  path: LatLng[];
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  country: string;
  center: LatLng;
  zoom: number;
  timezone: string;
  routes: CityRouteData[];
  /** approximate lat/lng offset used for fleet bus scatter */
  fleetOffset: LatLng;
}

// ─── School ───────────────────────────────────────────────────────────────────

export interface SchoolData {
  id: string;
  name: string;
  cityId: string;
  lat: number;
  lng: number;
  address: string;
  type: string;
  board: string;
  grades: string;
  phone: string;
}

// ─── Driver ───────────────────────────────────────────────────────────────────

export interface DriverProfile {
  id: string;
  name: string;
  photo: string;
  rating: number;
  phone: string;
  experience: string;
  licenseNo: string;
  cityId: string;
}

// ─── Bus ─────────────────────────────────────────────────────────────────────

export interface BusProfile {
  id: string;
  number: string;
  registration: string;
  capacity: number;
  fuel: number;
  battery: number;
  engine: "healthy" | "warning" | "critical";
  networkSignal: number;
  temperature: number;
  occupancy: number;
  mileage: number;
  insurance: string;
  lastService: string;
  healthStatus: "excellent" | "good" | "fair";
  cityId: string;
}

// ─── Student ──────────────────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  name: string;
  photo: string;
  class: string;
  seatNumber: string;
  guardian: string;
  stopName: string;
  cityId: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  photo: string;
  class: string;
  seatNumber: string;
  busId: string;
  busNumber: string;
  routeId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  boarded: boolean;
  boardedAt?: string;
  boardedStop?: string;
  reachedSchool: boolean;
  reachedHome: boolean;
  currentStop?: string;
  cityId: string;
}

// ─── Parent ───────────────────────────────────────────────────────────────────

export interface ParentProfile {
  id: string;
  name: string;
  photo: string;
  childId: string;
  cityId: string;
}

// ─── Geolocation / Reverse Geocode ───────────────────────────────────────────

export type LocationPermission = "granted" | "denied" | "prompt" | "unknown";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface ReverseGeoResult {
  city: string;
  state: string;
  country: string;
  displayName: string;
}

// ─── Resolved session context ─────────────────────────────────────────────────

export interface LocationContext {
  /** City id that maps to CITY_DATABASE key */
  cityId: string;
  city: CityData;
  school: SchoolData;
  route: CityRouteData;
  driver: DriverProfile;
  bus: BusProfile;
  student: StudentProfile;
  child: ChildProfile;
  parent: ParentProfile;
  userLocation: UserLocation;
  locationPermission: LocationPermission;
  cityLabel: string; // e.g. "Hyderabad" or "Bengaluru"
}

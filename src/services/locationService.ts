/**
 * locationService.ts
 *
 * Responsibilities:
 *  1. Request browser Geolocation permission
 *  2. Reverse-geocode the coordinates via Nominatim (no API key required)
 *  3. Match the resulting city name to our CITY_DATABASE
 *  4. Fall back to DEFAULT_CITY_ID if denied or unrecognised
 *
 * FUTURE BACKEND: Replace nominatimReverseGeocode() with your own
 * geocoding endpoint (e.g. GET /api/geocode?lat=&lng=).
 */

import { CITY_DATABASE, CITY_LIST, DEFAULT_CITY_ID } from "@/data/cities";
import type {
  UserLocation,
  ReverseGeoResult,
  LocationPermission,
  CityData,
} from "@/types/location";

// ─── Nominatim reverse-geocode ────────────────────────────────────────────────

interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  display_name?: string;
}

export async function nominatimReverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeoResult> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

  const res = await fetch(url, {
    headers: { "Accept-Language": "en-US,en;q=0.9" },
  });

  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const data: NominatimResponse = await res.json();
  const addr = data.address ?? {};

  const city =
    addr.city ?? addr.town ?? addr.village ?? addr.county ?? "Unknown City";
  const state = addr.state ?? "Unknown State";
  const country = addr.country ?? "Unknown Country";
  const displayName = data.display_name ?? `${city}, ${state}`;

  return { city, state, country, displayName };
}

// ─── City matching ────────────────────────────────────────────────────────────

/**
 * Normalise a string for fuzzy comparison:
 * lowercase, remove diacritics, strip common suffixes like "city" / "district".
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(city|district|urban|municipal)\b/g, "")
    .trim();
}

/**
 * Match a geocoded city name to one of our known cities.
 * Returns the matched CityData or the default fallback.
 */
export function matchCity(geocodedCity: string): CityData {
  const needle = normalise(geocodedCity);

  // 1. Exact key match (e.g. "hyderabad")
  if (CITY_DATABASE[needle]) return CITY_DATABASE[needle];

  // 2. Partial match against city names
  const partial = CITY_LIST.find(
    (c) =>
      normalise(c.name).includes(needle) ||
      needle.includes(normalise(c.name))
  );
  if (partial) return partial;

  // 3. Aliases — common alternate spellings
  const ALIASES: Record<string, string> = {
    bangalore: "bengaluru",
    "bengalore": "bengaluru",
    "banglore": "bengaluru",
    "new delhi": "delhi",
    "navi mumbai": "mumbai",
    "greater mumbai": "mumbai",
    secunderabad: "hyderabad",
    "cyberabad": "hyderabad",
    madras: "chennai",
    bombay: "mumbai",
    poona: "pune",
    poonawell: "pune",
  };
  const aliasKey = normalise(geocodedCity);
  for (const [alias, cityId] of Object.entries(ALIASES)) {
    if (aliasKey.includes(alias) || alias.includes(aliasKey)) {
      return CITY_DATABASE[cityId] ?? CITY_DATABASE[DEFAULT_CITY_ID];
    }
  }

  // 4. Fallback
  return CITY_DATABASE[DEFAULT_CITY_ID];
}

// ─── Geolocation wrapper ──────────────────────────────────────────────────────

export function checkGeolocationPermission(): Promise<LocationPermission> {
  if (!("permissions" in navigator)) return Promise.resolve("unknown");
  return navigator.permissions
    .query({ name: "geolocation" })
    .then((result) => result.state as LocationPermission)
    .catch(() => "unknown");
}

export function getCurrentPosition(
  options?: PositionOptions
): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
        ...options,
      }
    );
  });
}

// ─── Composed "detect city" entry point ───────────────────────────────────────

export interface DetectCityResult {
  cityId: string;
  city: CityData;
  userLocation: UserLocation;
  geocodeResult: ReverseGeoResult | null;
  permission: LocationPermission;
}

/**
 * Full pipeline:
 *   browser location → reverse geocode → city match → return context
 *
 * Never throws — falls back gracefully at every step.
 */
export async function detectCity(): Promise<DetectCityResult> {
  const fallbackLocation: UserLocation = {
    lat: CITY_DATABASE[DEFAULT_CITY_ID].center.lat,
    lng: CITY_DATABASE[DEFAULT_CITY_ID].center.lng,
  };

  // Step 1 – Permission check
  const permission = await checkGeolocationPermission();

  if (permission === "denied") {
    return {
      cityId: DEFAULT_CITY_ID,
      city: CITY_DATABASE[DEFAULT_CITY_ID],
      userLocation: fallbackLocation,
      geocodeResult: null,
      permission: "denied",
    };
  }

  // Step 2 – Get position
  let userLocation: UserLocation;
  let resolvedPermission: LocationPermission = permission;

  try {
    userLocation = await getCurrentPosition();
    resolvedPermission = "granted";
  } catch {
    // Denied or timeout — use default city centre
    return {
      cityId: DEFAULT_CITY_ID,
      city: CITY_DATABASE[DEFAULT_CITY_ID],
      userLocation: fallbackLocation,
      geocodeResult: null,
      permission: "denied",
    };
  }

  // Step 3 – Reverse geocode
  let geocodeResult: ReverseGeoResult | null = null;
  let city: CityData = CITY_DATABASE[DEFAULT_CITY_ID];

  try {
    geocodeResult = await nominatimReverseGeocode(
      userLocation.lat,
      userLocation.lng
    );
    city = matchCity(geocodeResult.city);
  } catch {
    // Geocode failed — fall back to nearest city by haversine distance
    city = nearestCity(userLocation.lat, userLocation.lng);
  }

  return {
    cityId: city.id,
    city,
    userLocation,
    geocodeResult,
    permission: resolvedPermission,
  };
}

// ─── Haversine nearest-city helper ───────────────────────────────────────────

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function nearestCity(lat: number, lng: number): CityData {
  let best = CITY_LIST[0];
  let bestDist = Infinity;
  for (const c of CITY_LIST) {
    const d = haversine(lat, lng, c.center.lat, c.center.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best;
}

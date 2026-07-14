import type { Coordinate } from "@/types/map";

const EARTH_RADIUS_KM = 6371;

export function haversineDistance(
  a: Coordinate,
  b: Coordinate
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function computeSegmentLengths(coordinates: Coordinate[]): number[] {
  const lengths: number[] = [0];
  for (let i = 1; i < coordinates.length; i++) {
    lengths.push(lengths[i - 1] + haversineDistance(coordinates[i - 1], coordinates[i]));
  }
  return lengths;
}

export function computeBearing(from: Coordinate, to: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function interpolateAlongLine(
  coordinates: Coordinate[],
  progress: number
): { lng: number; lat: number; bearing: number; progress: number } {
  if (coordinates.length === 0) {
    return { lng: 0, lat: 0, bearing: 0, progress: 0 };
  }
  if (coordinates.length === 1) {
    return { lng: coordinates[0][0], lat: coordinates[0][1], bearing: 0, progress: 0 };
  }

  const clamped = Math.max(0, Math.min(1, progress));
  const cumulative = computeSegmentLengths(coordinates);
  const total = cumulative[cumulative.length - 1] || 1;
  const target = clamped * total;

  let segmentIndex = 0;
  while (segmentIndex < cumulative.length - 1 && cumulative[segmentIndex + 1] < target) {
    segmentIndex++;
  }

  const start = coordinates[segmentIndex];
  const end = coordinates[Math.min(segmentIndex + 1, coordinates.length - 1)];
  const segmentStart = cumulative[segmentIndex];
  const segmentEnd = cumulative[Math.min(segmentIndex + 1, cumulative.length - 1)];
  const segmentLength = Math.max(segmentEnd - segmentStart, 0.000001);
  const t = (target - segmentStart) / segmentLength;

  return {
    lng: start[0] + (end[0] - start[0]) * t,
    lat: start[1] + (end[1] - start[1]) * t,
    bearing: computeBearing(start, end),
    progress: clamped,
  };
}

export function distanceAlongRoute(
  coordinates: Coordinate[],
  progress: number
): number {
  const cumulative = computeSegmentLengths(coordinates);
  const total = cumulative[cumulative.length - 1] || 0;
  return total * Math.max(0, Math.min(1, 1 - progress));
}

/** Full loop duration for bus animation (ms). */
export const BUS_LOOP_DURATION_MS = 120_000;

/** Realistic average bus speed for simulation (km/h). */
export const AVERAGE_BUS_SPEED_KMH = 32;

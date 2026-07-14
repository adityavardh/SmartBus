/**
 * routingService.ts
 *
 * Converts city route data → the GeoJSON + coordinate formats that
 * useRoute / RouteLayer / BusMap expect.
 *
 * FUTURE BACKEND: Replace with GET /api/routes/:id which returns GeoJSON.
 */

import type { Feature, LineString } from "geojson";
import type { Coordinate, MapBounds } from "@/types/map";
import type { CityRouteData, SchoolData } from "@/types/location";

/** Convert a city route's path (array of LatLng) to [lng,lat] Coordinate[]. */
export function routeToCoordinates(route: CityRouteData): Coordinate[] {
  return route.path.map((p) => [p.lng, p.lat] as Coordinate);
}

/** Build a GeoJSON Feature<LineString> from a city route. */
export function routeToGeoJSON(
  route: CityRouteData,
  school: SchoolData
): Feature<LineString> {
  return {
    type: "Feature",
    properties: {
      id: route.id,
      name: route.name,
      school: school.name,
    },
    geometry: {
      type: "LineString",
      coordinates: routeToCoordinates(route),
    },
  };
}

/** Compute tight bounding box + centre for a set of [lng,lat] coordinates. */
export function computeRouteBounds(coordinates: Coordinate[]): MapBounds {
  if (coordinates.length === 0) {
    // Fallback: Hyderabad
    return {
      bounds: [
        [78.35, 17.43],
        [78.45, 17.52],
      ],
      center: [78.40, 17.475],
    };
  }

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  const padding = 0.008;
  return {
    bounds: [
      [minLng - padding, minLat - padding],
      [maxLng + padding, maxLat + padding],
    ],
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
  };
}

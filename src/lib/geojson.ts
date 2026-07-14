import type { Feature, LineString } from "geojson";
import type { Coordinate, MapBounds } from "@/types/map";

export function getLineCoordinates(
  feature: Feature<LineString>
): Coordinate[] {
  return feature.geometry.coordinates as Coordinate[];
}

export function getRouteBounds(coordinates: Coordinate[]): MapBounds {
  if (coordinates.length === 0) {
    return {
      bounds: [
        [77.19, 28.52],
        [77.23, 28.56],
      ],
      center: [77.205, 28.542],
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

export function latLngToCoordinate(lat: number, lng: number): Coordinate {
  return [lng, lat];
}

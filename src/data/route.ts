import type { Feature, LineString } from "geojson";
import routeCoordinates from "./route-coords.json";
import { MAIN_ROUTE } from "./mock";

export const BUS_ROUTE_GEOJSON: Feature<LineString> = {
  type: "Feature",
  properties: {
    id: MAIN_ROUTE.id,
    name: MAIN_ROUTE.name,
    school: MAIN_ROUTE.school,
  },
  geometry: {
    type: "LineString",
    coordinates: routeCoordinates as [number, number][],
  },
};

export const ROUTE_WAYPOINTS: [number, number][] = MAIN_ROUTE.stops.map((stop) => [
  stop.lng,
  stop.lat,
]);

export const SCHOOL_LOCATION = {
  lng: 77.228,
  lat: 28.545,
  name: MAIN_ROUTE.school,
};

/** Parent waiting near the student's stop (Saket District Centre). */
export const PARENT_LOCATION = {
  lng: 77.2048,
  lat: 28.5225,
  name: "Parent Location",
};

import type { Coordinate } from "@/types/map";

/**
 * Optional runtime routing via the free OSRM demo server.
 * Pre-baked route data is preferred so the app works offline.
 */
export async function fetchRoadRoute(
  waypoints: Coordinate[]
): Promise<Coordinate[]> {
  if (waypoints.length < 2) return waypoints;

  const coords = waypoints.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) return waypoints;
    const json = await response.json();
    return json.routes?.[0]?.geometry?.coordinates ?? waypoints;
  } catch {
    return waypoints;
  }
}

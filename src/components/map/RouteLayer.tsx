"use client";

import { MapRoute } from "@/components/ui/map";
import type { Coordinate } from "@/types/map";

const ROUTE_COLOR = "#2E8BFF";

interface RouteLayerProps {
  coordinates: Coordinate[];
  showTraffic?: boolean;
}

export function RouteLayer({ coordinates, showTraffic }: RouteLayerProps) {
  if (coordinates.length < 2) return null;

  return (
    <>
      <MapRoute
        id="route-glow"
        coordinates={coordinates}
        color={ROUTE_COLOR}
        width={14}
        opacity={0.2}
        interactive={false}
      />
      {showTraffic && (
        <MapRoute
          id="route-traffic"
          coordinates={coordinates}
          color="#FFC247"
          width={8}
          opacity={0.15}
          dashArray={[2, 4]}
          interactive={false}
        />
      )}
      <MapRoute
        id="route-main"
        coordinates={coordinates}
        color={ROUTE_COLOR}
        width={5}
        opacity={0.92}
        interactive={false}
      />
    </>
  );
}

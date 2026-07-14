"use client";

import { memo } from "react";
import { MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";
import { useLocationStore, selectFleetBuses, selectBus } from "@/store/locationStore";

interface FleetMarkersProps {
  excludeBusId?: string;
}

function FleetMarkersInner({ excludeBusId }: FleetMarkersProps) {
  const fleetBuses = useLocationStore(selectFleetBuses);
  const primaryBus = useLocationStore(selectBus);

  // Exclude the primary (animated) bus — its marker is handled by BusMarker
  const exclude = excludeBusId ?? primaryBus.id;

  return (
    <>
      {fleetBuses
        .filter((bus) => bus.id !== exclude)
        .map((bus) => (
          <MapMarker
            key={bus.id}
            longitude={bus.position.lng}
            latitude={bus.position.lat}
            anchor="center"
          >
            <MarkerContent className="group">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-primary/20 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(46,139,255,0.5)] transition-transform group-hover:scale-110">
                {bus.number.split("-")[1] ?? bus.number.slice(-2)}
              </div>
            </MarkerContent>
            <MarkerTooltip className="rounded-lg border border-white/10 bg-card/95 px-2 py-1 text-[11px] text-white shadow-float backdrop-blur-xl">
              {bus.number} • {bus.driver}
            </MarkerTooltip>
          </MapMarker>
        ))}
    </>
  );
}

export const FleetMarkers = memo(FleetMarkersInner);

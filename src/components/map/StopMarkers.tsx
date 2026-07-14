"use client";

import { memo } from "react";
import { MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { useLocationStore, selectRoute } from "@/store/locationStore";

function StopMarkersInner() {
  const route = useLocationStore(selectRoute);
  const stops = route.stops;

  return (
    <>
      {stops.map((stop) => {
        const dotColor =
          stop.status === "completed"
            ? "#22C55E"
            : stop.status === "current"
              ? "#FFC247"
              : "rgba(255,255,255,0.5)";

        return (
          <MapMarker
            key={stop.id}
            longitude={stop.lng}
            latitude={stop.lat}
            anchor="center"
          >
            <MarkerContent className="group">
              <div
                className="h-3 w-3 rounded-full border-2 border-white/60 transition-transform duration-200 group-hover:scale-125"
                style={{
                  background: dotColor,
                  boxShadow: `0 0 8px ${dotColor}88`,
                }}
              />
            </MarkerContent>
            <MarkerTooltip className="rounded-lg border border-white/10 bg-card/95 px-2 py-1 text-[11px] text-white shadow-float backdrop-blur-xl">
              {stop.name}
            </MarkerTooltip>
            <MarkerPopup className="rounded-xl border border-white/10 bg-card/95 p-3 text-white shadow-float backdrop-blur-xl">
              <p className="text-sm font-semibold">{stop.name}</p>
              {stop.time && (
                <p className="text-xs text-white/50 mt-0.5">{stop.time}</p>
              )}
              {stop.studentsWaiting !== undefined &&
                stop.studentsWaiting > 0 && (
                  <p className="text-xs text-accent mt-1">
                    {stop.studentsWaiting} students waiting
                  </p>
                )}
            </MarkerPopup>
          </MapMarker>
        );
      })}
    </>
  );
}

export const StopMarkers = memo(StopMarkersInner);

"use client";

import { School } from "lucide-react";
import { MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { useLocationStore, selectSchool } from "@/store/locationStore";

export function SchoolMarker() {
  const school = useLocationStore(selectSchool);

  return (
    <MapMarker
      longitude={school.lng}
      latitude={school.lat}
      anchor="center"
    >
      <MarkerContent className="group">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary/60 bg-primary/20 shadow-[0_0_12px_rgba(46,139,255,0.5)] transition-transform duration-200 group-hover:scale-110">
          <School className="h-4 w-4 text-primary" />
        </div>
      </MarkerContent>
      <MarkerTooltip className="rounded-lg border border-white/10 bg-card/95 px-2 py-1 text-[11px] text-white shadow-float backdrop-blur-xl">
        {school.name}
      </MarkerTooltip>
      <MarkerPopup className="rounded-xl border border-white/10 bg-card/95 p-3 text-white shadow-float backdrop-blur-xl">
        <p className="text-sm font-semibold">{school.name}</p>
        <p className="text-xs text-white/50 mt-0.5">Destination • {school.type}</p>
        <p className="text-xs text-white/40 mt-0.5">{school.board}</p>
      </MarkerPopup>
    </MapMarker>
  );
}

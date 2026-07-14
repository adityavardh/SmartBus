"use client";

import { MapPin } from "lucide-react";
import { MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { useParent } from "@/hooks/useParent";

export function ParentMarker() {
  const { parent, child, position } = useParent();

  return (
    <MapMarker
      longitude={position.lng}
      latitude={position.lat}
      anchor="center"
    >
      <MarkerContent className="group">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#8b5cf6]/60 bg-[#8b5cf6]/20 shadow-[0_0_12px_rgba(139,92,246,0.5)] transition-transform duration-200 group-hover:scale-110">
          <MapPin className="h-4 w-4 text-[#8b5cf6]" />
        </div>
      </MarkerContent>
      <MarkerTooltip className="rounded-lg border border-white/10 bg-card/95 px-2 py-1 text-[11px] text-white shadow-float backdrop-blur-xl">
        {parent.name}
      </MarkerTooltip>
      <MarkerPopup className="rounded-xl border border-white/10 bg-card/95 p-3 text-white shadow-float backdrop-blur-xl">
        <p className="text-sm font-semibold">{parent.name}</p>
        <p className="text-xs text-white/50 mt-0.5">
          Waiting for {child.name}
        </p>
        <p className="text-xs text-white/40 mt-0.5">Near {child.currentStop ?? child.boardedStop ?? "pickup stop"}</p>
      </MarkerPopup>
    </MapMarker>
  );
}

"use client";

import { Bus } from "lucide-react";
import { MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";

interface BusMarkerProps {
  lng: number;
  lat: number;
  bearing: number;
  busNumber?: string;
  speed?: number;
}

export function BusMarker({
  lng,
  lat,
  bearing,
  busNumber = "SB-12",
  speed = 0,
}: BusMarkerProps) {
  return (
    <MapMarker
      longitude={lng}
      latitude={lat}
      rotation={bearing}
      rotationAlignment="map"
      anchor="center"
    >
      <MarkerContent className="group">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent/20 shadow-[0_0_16px_rgba(255,194,71,0.7)] transition-transform duration-200 group-hover:scale-110">
          <Bus className="h-5 w-5 text-accent" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success animate-pulse" />
        </div>
      </MarkerContent>
      <MarkerTooltip className="rounded-xl border border-white/10 bg-card/95 px-2.5 py-1.5 text-xs text-white shadow-float backdrop-blur-xl">
        {busNumber} • {speed} km/h
      </MarkerTooltip>
      <MarkerPopup className="rounded-xl border border-white/10 bg-card/95 p-3 text-white shadow-float backdrop-blur-xl">
        <p className="text-sm font-semibold">{busNumber}</p>
        <p className="text-xs text-white/50 mt-0.5">Live bus • {speed} km/h</p>
      </MarkerPopup>
    </MapMarker>
  );
}

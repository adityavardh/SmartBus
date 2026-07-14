"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import type MapLibreGL from "maplibre-gl";
import {
  Map,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { RouteLayer } from "./RouteLayer";
import { BusMarker } from "./BusMarker";
import { StopMarkers } from "./StopMarkers";
import { SchoolMarker } from "./SchoolMarker";
import { ParentMarker } from "./ParentMarker";
import { FleetMarkers } from "./FleetMarkers";
import { useRoute } from "@/hooks/useRoute";
import { useBusAnimation } from "@/hooks/useBusAnimation";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import { MAP_STYLES, SATELLITE_STYLE } from "@/lib/map-styles";
import { useLocationStore } from "@/store/locationStore";
import type { MapStyleMode } from "@/types/map";

export interface BusMapHandle {
  fitRoute: () => void;
  resetBearing: () => void;
  locate: () => void;
  toggleFullscreen: () => void;
  getMap: () => MapLibreGL.Map | null;
}

interface BusMapProps {
  mapStyle?: MapStyleMode;
  showFleet?: boolean;
  showTraffic?: boolean;
  followBus?: boolean;
  onReady?: () => void;
  speed?: number;
}

function MapInternals({
  showFleet,
  showTraffic,
  followBus,
  onReady,
  speed,
  mapRef,
}: Omit<BusMapProps, "mapStyle"> & { mapRef: React.RefObject<BusMapHandle | null> }) {
  const { map, isLoaded } = useMap();
  const { coordinates, bounds } = useRoute();
  const busPosition = useBusAnimation({ enabled: true, loop: true });
  const telemetry = useBusSimulation();
  const hasFitRef = useRef(false);

  const fitRoute = useCallback(() => {
    if (!map || coordinates.length < 2) return;
    map.fitBounds(bounds.bounds, { padding: 60, duration: 800 });
  }, [map, coordinates.length, bounds.bounds]);

  const resetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const locate = useCallback(() => {
    if (!map || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: 1500,
        });
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [map]);

  const toggleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  useImperativeHandle(
    mapRef,
    () => ({
      fitRoute,
      resetBearing,
      locate,
      toggleFullscreen,
      getMap: () => map,
    }),
    [fitRoute, resetBearing, locate, toggleFullscreen, map]
  );

  useEffect(() => {
    if (isLoaded && !hasFitRef.current) {
      hasFitRef.current = true;
      fitRoute();
      onReady?.();
    }
  }, [isLoaded, fitRoute, onReady]);

  useEffect(() => {
    if (!followBus || !map || !isLoaded) return;
    map.easeTo({
      center: [busPosition.lng, busPosition.lat],
      bearing: busPosition.bearing,
      duration: 800,
      essential: true,
    });
  }, [followBus, map, isLoaded, busPosition.lng, busPosition.lat, busPosition.bearing]);

  const displaySpeed = speed ?? telemetry.speed;

  return (
    <>
      <RouteLayer coordinates={coordinates} showTraffic={showTraffic} />
      <StopMarkers />
      <SchoolMarker />
      <ParentMarker />
      {showFleet && <FleetMarkers />}
      <BusMarker
        lng={busPosition.lng}
        lat={busPosition.lat}
        bearing={busPosition.bearing}
        speed={displaySpeed}
      />
    </>
  );
}

export const BusMap = forwardRef<BusMapHandle, BusMapProps>(function BusMap(
  props,
  ref
) {
  const internalRef = useRef<BusMapHandle | null>(null);
  const mapInstanceRef = useRef<MapRef | null>(null);

  // Dynamic city centre — replaces hardcoded [77.205, 28.542]
  const city = useLocationStore((s) => s.city);
  const initialCenter: [number, number] = [
    city.center.lng,
    city.center.lat,
  ];

  useImperativeHandle(ref, () => ({
    fitRoute: () => internalRef.current?.fitRoute(),
    resetBearing: () => internalRef.current?.resetBearing(),
    locate: () => internalRef.current?.locate(),
    toggleFullscreen: () => internalRef.current?.toggleFullscreen(),
    getMap: () => internalRef.current?.getMap() ?? null,
  }));

  const styles =
    props.mapStyle === "satellite"
      ? { dark: SATELLITE_STYLE, light: SATELLITE_STYLE }
      : { dark: MAP_STYLES.dark, light: MAP_STYLES.light };

  return (
    <Map
      ref={mapInstanceRef}
      className="absolute inset-0"
      theme="dark"
      styles={styles}
      center={initialCenter}
      zoom={city.zoom}
      bearing={0}
      pitch={0}
      attributionControl={{ compact: true }}
    >
      <MapInternals {...props} mapRef={internalRef} />
    </Map>
  );
});

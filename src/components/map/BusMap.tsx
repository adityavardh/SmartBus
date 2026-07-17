"use client";

/**
 * BusMap.tsx
 *
 * ── What changed ─────────────────────────────────────────────────────────────
 * MapInternals now reads road-snapped coordinates from useRoadRoute() instead
 * of the straight-line coordinates from useRoute().  Both useBusAnimation and
 * RouteLayer receive the same snapped geometry so the bus marker always rides
 * on top of the rendered line.
 *
 * fitRoute() also uses the snapped bounds once available, giving a tighter
 * viewport that frames the actual road path rather than the bounding box of
 * the raw waypoints.
 *
 * Everything else (markers, fleet, follow-bus, fullscreen, style toggle) is
 * completely unchanged.
 */

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
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { useBusAnimation } from "@/hooks/useBusAnimation";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import { MAP_STYLES, SATELLITE_STYLE } from "@/lib/map-styles";
import { useLocationStore, selectBus } from "@/store/locationStore";
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

  // ── Road-snapped route ────────────────────────────────────────────────────
  const { coordinates, bounds } = useRoadRoute();

  // ── Bus animation ─────────────────────────────────────────────────────────
  const busPosition = useBusAnimation({ enabled: true, loop: true, coordinates });
  const telemetry   = useBusSimulation();
  const bus         = useLocationStore(selectBus);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const hasFitRef      = useRef(false);
  // Task 2: track the last bounds we actually fitted so we can compare values,
  // not object references.  Prevents fitBounds firing on every render.
  const lastBoundsKey  = useRef<string>("");
  // Task 3: keep the latest bus position in a ref so the follow-bus interval
  // reads it without needing busPosition in its dependency array (which would
  // re-subscribe at 60 fps and fight user pan/zoom).
  const busPositionRef = useRef(busPosition);
  busPositionRef.current = busPosition;
  // Track the last time the user manually interacted with the map.
  const lastUserInteractionRef = useRef<number>(0);

  // ── Map controls ──────────────────────────────────────────────────────────

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
    () => ({ fitRoute, resetBearing, locate, toggleFullscreen, getMap: () => map }),
    [fitRoute, resetBearing, locate, toggleFullscreen, map]
  );

  // ── Track user interaction so follow-bus never fights manual pan/zoom ─────
  useEffect(() => {
    if (!map || !isLoaded) return;
    const recordInteraction = () => {
      lastUserInteractionRef.current = performance.now();
    };
    // mousedown / touchstart covers drag starts; wheel covers scroll-zoom
    map.on("mousedown",  recordInteraction);
    map.on("touchstart", recordInteraction);
    map.on("wheel",      recordInteraction);
    return () => {
      map.off("mousedown",  recordInteraction);
      map.off("touchstart", recordInteraction);
      map.off("wheel",      recordInteraction);
    };
  }, [map, isLoaded]);

  // ── Initial fit on load ───────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && !hasFitRef.current) {
      hasFitRef.current = true;
      fitRoute();
      onReady?.();
    }
  }, [isLoaded, fitRoute, onReady]);

  // ── Task 2: re-fit only when bounds VALUES change, never on identity churn ─
  // Serialise the bounds corners to a string key. fitBounds fires at most once
  // per genuinely different bounding box (i.e. only when OSRM resolves for a
  // new city), never on the 500 ms busProgress render cycles.
  useEffect(() => {
    if (!isLoaded || !hasFitRef.current) return;

    const [[minLng, minLat], [maxLng, maxLat]] = bounds.bounds as [
      [number, number],
      [number, number]
    ];
    const key = `${minLng.toFixed(4)},${minLat.toFixed(4)},${maxLng.toFixed(4)},${maxLat.toFixed(4)}`;

    if (key === lastBoundsKey.current) return; // same box — do nothing
    lastBoundsKey.current = key;
    fitRoute();
  }, [isLoaded, bounds, fitRoute]);

  // ── Task 3: follow-bus via a stable interval, NOT a high-freq useEffect ───
  // The interval reads busPositionRef (always current) instead of taking
  // busPosition as a dependency.  This means the effect never re-subscribes
  // at 60 fps, and it respects a 3-second "hands-off" window after the user
  // last touched the map so manual pan/zoom is never overridden.
  useEffect(() => {
    if (!followBus || !map || !isLoaded) return;

    const USER_COOLDOWN_MS = 3_000; // don't auto-pan for 3 s after user interaction

    const id = setInterval(() => {
      // Skip if the user interacted recently
      if (performance.now() - lastUserInteractionRef.current < USER_COOLDOWN_MS) return;
      // Skip if the map is already animating (e.g. from fitBounds)
      if (map.isMoving()) return;

      const pos = busPositionRef.current;
      map.easeTo({
        center:   [pos.lng, pos.lat],
        bearing:  pos.bearing,
        duration: 800,
        essential: true,
      });
    }, 1_000); // re-centre at most every 1 s

    return () => clearInterval(id);
  // followBus, map, isLoaded are the only stable deps needed —
  // busPosition is accessed via ref, not the dep array.
  }, [followBus, map, isLoaded]);

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
        busNumber={bus.number}
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

  const city = useLocationStore((s) => s.city);
  const initialCenter: [number, number] = [city.center.lng, city.center.lat];

  useImperativeHandle(ref, () => ({
    fitRoute:        () => internalRef.current?.fitRoute(),
    resetBearing:    () => internalRef.current?.resetBearing(),
    locate:          () => internalRef.current?.locate(),
    toggleFullscreen:() => internalRef.current?.toggleFullscreen(),
    getMap:          () => internalRef.current?.getMap() ?? null,
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

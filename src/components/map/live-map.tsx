"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDemoStore } from "@/store";
import { FLEET_BUSES, MAIN_ROUTE, WEATHER, DEFAULT_DEMO } from "@/data/mock";
import { interpolatePosition } from "@/lib/utils";
import {
  Navigation,
  Maximize2,
  Minimize2,
  Layers,
  LocateFixed,
  Compass,
  Satellite,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { Map as LeafletMap, Marker } from "leaflet";

interface LiveMapProps {
  fullscreen?: boolean;
  showFleet?: boolean;
}

export function LiveMap({ fullscreen, showFleet }: LiveMapProps) {
  const router = useRouter();
  const { demo } = useDemoStore();
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [showTraffic, setShowTraffic] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapRef = useRef<LeafletMap | null>(null);
  const busMarkerRef = useRef<Marker | null>(null);
  const tileLayerRef = useRef<ReturnType<typeof import("leaflet")["tileLayer"]> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const busPos = interpolatePosition(MAIN_ROUTE.path, demo.busProgress);

  const mapHeight = isFullscreen
    ? "h-[calc(100vh-80px)]"
    : fullscreen
    ? "h-[calc(100vh-200px)]"
    : "h-[460px]";

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      router.push("/map");
    } else {
      setIsFullscreen(false);
    }
  };

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (typeof window === "undefined") return;

    let destroyed = false;

    import("leaflet").then((L) => {
      if (destroyed || mapRef.current) return;

      // Fix default marker icons
      const proto = L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown };
      delete proto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const m = L.map("leaflet-map-container", {
        zoomControl: false,
        attributionControl: false,
      }).setView([28.542, 77.205], 13.5);

      const darkTile = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(m);

      mapRef.current = m;
      tileLayerRef.current = darkTile as unknown as ReturnType<typeof import("leaflet")["tileLayer"]>;

      // Route polyline
      const pathCoords: [number, number][] = MAIN_ROUTE.path.map((p) => [p.lat, p.lng]);
      L.polyline(pathCoords, { color: "#2E8BFF", weight: 5, opacity: 0.8 }).addTo(m);

      // Stop markers
      MAIN_ROUTE.stops.forEach((stop) => {
        const dotColor =
          stop.status === "completed" ? "#22C55E" :
          stop.status === "current" ? "#FFC247" : "rgba(255,255,255,0.4)";

        const stopIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${dotColor};border:2px solid rgba(255,255,255,0.6);box-shadow:0 0 8px ${dotColor}88"></div>`,
          className: "",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(m)
          .bindPopup(`<b style="font-size:12px">${stop.name}</b><br/><small>${stop.time}</small>`);
      });

      // School destination marker
      const schoolIcon = L.divIcon({
        html: `<div style="font-size:20px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🏫</div>`,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker([28.545, 77.228], { icon: schoolIcon }).addTo(m);

      // Primary bus marker
      const busIcon = L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50%;background:rgba(255,194,71,0.2);border:2px solid #FFC247;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 16px rgba(255,194,71,0.7)">🚌</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const busMarker = L.marker([busPos.lat, busPos.lng], { icon: busIcon }).addTo(m);
      busMarkerRef.current = busMarker;

      // Fleet buses
      if (showFleet) {
        FLEET_BUSES.filter((b) => b.id !== "b1").forEach((bus) => {
          const fleetIcon = L.divIcon({
            html: `<div style="width:26px;height:26px;border-radius:50%;background:rgba(46,139,255,0.2);border:2px solid #2E8BFF;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:white">${bus.number}</div>`,
            className: "",
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });
          L.marker([bus.position.lat, bus.position.lng], { icon: fleetIcon }).addTo(m);
        });
      }
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        busMarkerRef.current = null;
        tileLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFleet]);

  // Update bus marker position whenever busProgress changes
  useEffect(() => {
    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([busPos.lat, busPos.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.busProgress]);

  // Toggle map tile style
  useEffect(() => {
    const m = mapRef.current;
    const currentTile = tileLayerRef.current;
    if (!m || !currentTile) return;

    import("leaflet").then((L) => {
      m.removeLayer(currentTile as unknown as L.Layer);
      const newTile = mapStyle === "satellite"
        ? L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 })
        : L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 });
      newTile.addTo(m);
      tileLayerRef.current = newTile as unknown as ReturnType<typeof import("leaflet")["tileLayer"]>;
    });
  }, [mapStyle]);

  const speedToShow = demo.enabled ? demo.speed : DEFAULT_DEMO.speed;
  const etaToShow = demo.enabled ? demo.eta : DEFAULT_DEMO.eta;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-glass-border transition-all duration-500 ${mapHeight} ${
        isFullscreen ? "fixed inset-0 z-[70] rounded-none h-screen" : ""
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-[60] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full mb-4"
          />
          <p className="text-white font-medium">Loading map data...</p>
        </div>
      )}

      {/* Leaflet Map Container */}
      <div id="leaflet-map-container" className="absolute inset-0 z-0" style={{ background: "#0d1b2e" }} />

      {/* Rain effect overlay */}
      {demo.isRaining && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 4.3 + (i * 1.7)) % 100}%`,
                top: -10,
                width: 1,
                height: 12 + (i % 4) * 3,
                background: "linear-gradient(180deg, transparent, rgba(100,160,255,0.5))",
              }}
              animate={{ y: ["0vh", "110vh"] }}
              transition={{
                duration: 0.5 + (i % 5) * 0.07,
                repeat: Infinity,
                delay: (i % 15) * 0.04,
                ease: "linear",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[rgba(60,100,160,0.05)] backdrop-blur-[0.5px]" />
        </div>
      )}

      {/* Map type badge */}
      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-white/50 font-medium backdrop-blur-xl select-none z-10">
        {mapStyle === "satellite" ? "🛰 Satellite" : "🗺 Street Map"} • Delhi NCR
      </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80 shadow-float"
          onClick={() => setMapStyle(mapStyle === "dark" ? "satellite" : "dark")}
          title={mapStyle === "dark" ? "Satellite view" : "Street view"}
        >
          {mapStyle === "dark" ? <Satellite className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={() => setShowTraffic(!showTraffic)}
          title="Traffic overlay"
        >
          <Navigation className={`w-4 h-4 ${showTraffic ? "text-accent" : "text-white/40"}`} />
        </Button>
        <Button variant="glass" size="icon" className="rounded-xl backdrop-blur-xl bg-card/80" title="Locate me">
          <LocateFixed className="w-4 h-4" />
        </Button>
        <Button variant="glass" size="icon" className="rounded-xl backdrop-blur-xl bg-card/80" title="Compass">
          <Compass className="w-4 h-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={toggleFullscreen}
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Bottom status card */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10">
        <motion.div
          className="rounded-[22px] bg-card/92 backdrop-blur-xl border border-white/10 p-4 inline-flex items-center gap-4 shadow-float"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center relative">
            <span className="text-lg">🚌</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-card animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-white/40">SB-12 • {speedToShow} km/h</p>
            <p className="text-sm font-semibold text-white">
              ETA: <span className="text-accent">{etaToShow} min</span>
            </p>
          </div>
          <div className="flex gap-1.5">
            {demo.trafficLevel === "heavy" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/20 border border-danger/30 text-danger font-medium">Traffic</span>
            )}
            {demo.isRaining && WEATHER.condition.toLowerCase().includes("rain") && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium">Rain</span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 border border-success/30 text-success font-medium">Live</span>
          </div>
        </motion.div>
      </div>

      {/* GPS lost warning */}
      {!demo.gpsConnected && !isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-20">
          <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-4 border border-danger/30">
            <WifiOff className="w-8 h-8 text-danger" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Unable to load live location</h3>
          <p className="text-white/60 max-w-sm">
            We&apos;ve lost connection to the bus&apos;s GPS tracker. Showing last known location until connection is restored.
          </p>
        </div>
      )}
    </div>
  );
}

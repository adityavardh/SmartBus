"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useDemoStore } from "@/store";
import { WEATHER, DEFAULT_DEMO } from "@/data/mock";
import { useLocationStore } from "@/store/locationStore";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import {
  Navigation,
  Maximize2,
  Minimize2,
  Layers,
  LocateFixed,
  Compass,
  Satellite,
  WifiOff,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RouteInfoPanel } from "./RouteInfoPanel";
import type { BusMapHandle } from "./BusMap";
import type { MapStyleMode } from "@/types/map";

const BusMap = dynamic(
  () => import("./BusMap").then((mod) => mod.BusMap),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-0 bg-[#0d1b2e]" aria-hidden />
    ),
  }
);

interface LiveMapProps {
  fullscreen?: boolean;
  showFleet?: boolean;
}

export function LiveMap({ fullscreen, showFleet }: LiveMapProps) {
  const router = useRouter();
  const { demo } = useDemoStore();
  const telemetry = useBusSimulation();
  const mapRef = useRef<BusMapHandle>(null);
  const cityLabel = useLocationStore((s) => s.cityLabel);

  const [mapStyle, setMapStyle] = useState<MapStyleMode>("dark");
  const [showTraffic, setShowTraffic] = useState(true);
  const [followBus, setFollowBus] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapHeight = isFullscreen
    ? "h-[calc(100vh-80px)]"
    : fullscreen
      ? "h-[calc(100vh-200px)]"
      : "h-[460px]";

  const toggleFullscreen = () => {
    if (!isFullscreen && fullscreen) {
      setIsFullscreen(true);
      mapRef.current?.toggleFullscreen();
    } else if (isFullscreen) {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } else {
      router.push("/map/student");
    }
  };

  const handleMapReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const speedToShow = demo.enabled ? demo.speed : DEFAULT_DEMO.speed;
  const etaToShow = demo.enabled ? demo.eta : DEFAULT_DEMO.eta;

  const panelTelemetry = {
    ...telemetry,
    speed: speedToShow,
    eta: etaToShow,
  };

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

      <BusMap
        ref={mapRef}
        mapStyle={mapStyle}
        showFleet={showFleet}
        showTraffic={showTraffic}
        followBus={followBus}
        onReady={handleMapReady}
        speed={speedToShow}
      />

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

      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-white/50 font-medium backdrop-blur-xl select-none z-10">
        {mapStyle === "satellite" ? "Satellite" : "Street Map"} • {cityLabel}
      </div>

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
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={() => setFollowBus(!followBus)}
          title="Follow bus"
        >
          <Crosshair className={`w-4 h-4 ${followBus ? "text-accent" : "text-white/40"}`} />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={() => mapRef.current?.fitRoute()}
          title="Fit to route"
        >
          <Layers className="w-4 h-4 rotate-90" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={() => mapRef.current?.locate()}
          title="Locate me"
        >
          <LocateFixed className="w-4 h-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="rounded-xl backdrop-blur-xl bg-card/80"
          onClick={() => mapRef.current?.resetBearing()}
          title="Reset bearing"
        >
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

      <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10">
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <RouteInfoPanel telemetry={panelTelemetry} compact />
        </motion.div>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {demo.trafficLevel === "heavy" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/20 border border-danger/30 text-danger font-medium">
              Traffic
            </span>
          )}
          {demo.isRaining && WEATHER.condition.toLowerCase().includes("rain") && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium">
              Rain
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 border border-success/30 text-success font-medium">
            Live
          </span>
        </div>
      </div>

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

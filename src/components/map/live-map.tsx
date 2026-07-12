"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore } from "@/store";
import { FLEET_BUSES, MAIN_ROUTE } from "@/data/mock";
import { interpolatePosition } from "@/lib/utils";
import {
  Navigation,
  Maximize2,
  Minimize2,
  Layers,
  LocateFixed,
  Compass,
  Satellite,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LiveMapProps {
  fullscreen?: boolean;
  showFleet?: boolean;
}

// Road network for realism
const ROADS = [
  // Major highways
  { d: "M 0,42 Q 25,38 50,40 T 100,38", stroke: "#2a3a5a", w: 2.5 },
  { d: "M 15,0 Q 18,30 20,55 T 22,100", stroke: "#2a3a5a", w: 2.5 },
  { d: "M 60,0 Q 63,30 65,60 T 68,100", stroke: "#2a3a5a", w: 2.5 },
  { d: "M 0,70 Q 30,66 60,68 T 100,67", stroke: "#2a3a5a", w: 2 },
  // Secondary roads
  { d: "M 20,0 Q 35,20 40,40 T 45,100", stroke: "#1e2d46", w: 1.2 },
  { d: "M 0,25 Q 25,23 50,24 T 100,23", stroke: "#1e2d46", w: 1.2 },
  { d: "M 0,55 Q 40,52 70,54 T 100,53", stroke: "#1e2d46", w: 1.2 },
  { d: "M 80,0 L 82,100", stroke: "#1e2d46", w: 1.2 },
  // Minor roads
  { d: "M 35,0 Q 37,15 38,30 T 42,55", stroke: "#182236", w: 0.7 },
  { d: "M 0,35 Q 18,33 36,35 T 60,34", stroke: "#182236", w: 0.7 },
  { d: "M 50,40 Q 58,50 65,60 T 75,80", stroke: "#182236", w: 0.7 },
  { d: "M 22,55 Q 40,53 55,55 T 68,54", stroke: "#182236", w: 0.7 },
  { d: "M 65,20 Q 72,30 75,45 T 80,68", stroke: "#182236", w: 0.7 },
  { d: "M 0,82 Q 30,80 55,82 T 80,80", stroke: "#182236", w: 0.7 },
];

// District / area blocks for map realism
const DISTRICTS = [
  { x: 21, y: 0, w: 18, h: 24, label: "Vasant Vihar", opacity: 0.06 },
  { x: 61, y: 0, w: 19, h: 22, label: "Saket", opacity: 0.05 },
  { x: 0, y: 43, w: 20, h: 24, label: "Hauz Khas", opacity: 0.06 },
  { x: 69, y: 40, w: 30, h: 26, label: "Greater Kailash", opacity: 0.05 },
  { x: 22, y: 56, w: 43, h: 24, label: "South Delhi", opacity: 0.04 },
];

export function LiveMap({ fullscreen, showFleet }: LiveMapProps) {
  const router = useRouter();
  const { demo } = useDemoStore();
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark");
  const [showTraffic, setShowTraffic] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);

  const busPos = interpolatePosition(MAIN_ROUTE.path, demo.busProgress);

  const toSVG = (lat: number, lng: number) => ({
    x: ((lng - 77.19) / 0.04) * 100,
    y: ((28.56 - lat) / 0.04) * 100,
  });

  const routePoints = MAIN_ROUTE.path
    .map((p) => {
      const { x, y } = toSVG(p.lat, p.lng);
      return `${x},${y}`;
    })
    .join(" ");

  const busSVG = toSVG(busPos.lat, busPos.lng);
  const progressIndex = Math.floor(demo.busProgress * (MAIN_ROUTE.path.length - 1));
  const traveledPoints = MAIN_ROUTE.path
    .slice(0, progressIndex + 1)
    .map((p) => {
      const { x, y } = toSVG(p.lat, p.lng);
      return `${x},${y}`;
    })
    .join(" ");

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

  const bgColor = mapStyle === "satellite" ? "#1a2b1a" : "#0d1b2e";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-glass-border transition-all duration-500 ${mapHeight} ${
        isFullscreen ? "fixed inset-0 z-[70] rounded-none h-screen" : ""
      }`}
    >
      {/* Base map background */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: bgColor }}
      >
        {/* Satellite texture overlay */}
        {mapStyle === "satellite" && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #2d4a1e 0%, transparent 40%), radial-gradient(circle at 70% 60%, #1e3a2a 0%, transparent 35%), radial-gradient(circle at 50% 80%, #243020 0%, transparent 30%)",
            }}
          />
        )}

        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.55)_100%)]" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="bus-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2E8BFF" />
              <stop offset="100%" stopColor="#FFC247" />
            </linearGradient>
            <marker id="arrow-marker" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
              <path d="M0,0 L0,4 L4,2 Z" fill="#2E8BFF" opacity="0.6" />
            </marker>
          </defs>

          {/* District shading */}
          {DISTRICTS.map((d) => (
            <rect
              key={d.label}
              x={d.x}
              y={d.y}
              width={d.w}
              height={d.h}
              fill="white"
              opacity={d.opacity}
              rx="0.5"
            />
          ))}

          {/* Road network — shadow pass */}
          {ROADS.map((r, i) => (
            <path
              key={`road-shadow-${i}`}
              d={r.d}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={r.w + 1}
              strokeLinecap="round"
            />
          ))}

          {/* Road network — main pass */}
          {ROADS.map((r, i) => (
            <path
              key={`road-${i}`}
              d={r.d}
              fill="none"
              stroke={r.stroke}
              strokeWidth={r.w}
              strokeLinecap="round"
            />
          ))}

          {/* Road center lines (dashes) for major roads */}
          {ROADS.slice(0, 4).map((r, i) => (
            <path
              key={`road-dash-${i}`}
              d={r.d}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.3}
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          ))}

          {/* Traffic congestion zone */}
          {showTraffic && demo.trafficLevel !== "low" && (
            <motion.path
              d="M 35,35 Q 40,38 45,42 T 52,48"
              fill="none"
              stroke={demo.trafficLevel === "heavy" ? "#EF4444" : "#F59E0B"}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={demo.trafficLevel === "heavy" ? 0.7 : 0.5}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Full route — faint background */}
          <polyline
            points={routePoints}
            fill="none"
            stroke="#2E8BFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.2"
          />

          {/* Full route — glow layer */}
          <polyline
            points={routePoints}
            fill="none"
            stroke="#2E8BFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#route-glow)"
            opacity="0.12"
          />

          {/* Dashed route overlay */}
          <polyline
            points={routePoints}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="0.5"
            strokeDasharray="1.5 2"
            strokeLinecap="round"
          />

          {/* Traveled path — bright */}
          {traveledPoints && (
            <>
              <motion.polyline
                points={traveledPoints}
                fill="none"
                stroke="#2E8BFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#route-glow)"
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Shimmering particles on traveled path */}
              <motion.polyline
                points={traveledPoints}
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 6"
                animate={{ strokeDashoffset: [0, -7] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                opacity="0.6"
              />
            </>
          )}

          {/* Bus stops */}
          {MAIN_ROUTE.stops.map((stop, idx) => {
            const { x, y } = toSVG(stop.lat, stop.lng);
            const isPast = idx < progressIndex;
            const isSelected = selectedStop === stop.id;
            return (
              <g
                key={stop.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedStop(isSelected ? null : stop.id)}
              >
                {/* Outer ring */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="none"
                  stroke={isPast ? "#22C55E" : "#FFC247"}
                  strokeWidth="0.5"
                  opacity={isPast ? 0.4 : 0.6}
                  animate={{ r: [3, 3.8, 3], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
                />
                {/* Inner dot */}
                <circle
                  cx={x}
                  cy={y}
                  r="1.4"
                  fill={isPast ? "#22C55E" : "#FFC247"}
                  opacity={isPast ? 0.7 : 1}
                />
                {/* Stop label */}
                <text
                  x={x}
                  y={y - 3.5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="2.2"
                  opacity="0.7"
                  fontWeight="500"
                >
                  {stop.name.split(" ")[0]}
                </text>

                {/* Tooltip on select */}
                {isSelected && (
                  <g>
                    <rect
                      x={x - 12}
                      y={y - 14}
                      width="24"
                      height="8"
                      rx="2"
                      fill="#0d1b2e"
                      stroke="#2E8BFF"
                      strokeWidth="0.4"
                      opacity="0.95"
                    />
                    <text x={x} y={y - 8.5} textAnchor="middle" fill="white" fontSize="2.5" fontWeight="600">
                      {stop.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* User location (school / destination) */}
          <g>
            <motion.circle
              cx={toSVG(28.524, 77.206).x}
              cy={toSVG(28.524, 77.206).y}
              r="3.5"
              fill="#22C55E"
              opacity="0.15"
              animate={{ r: [3.5, 5.5, 3.5], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx={toSVG(28.524, 77.206).x} cy={toSVG(28.524, 77.206).y} r="1.2" fill="#22C55E" />
            <circle
              cx={toSVG(28.524, 77.206).x}
              cy={toSVG(28.524, 77.206).y}
              r="1.2"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
            <text
              x={toSVG(28.524, 77.206).x + 2.5}
              y={toSVG(28.524, 77.206).y + 0.8}
              fill="#22C55E"
              fontSize="2.2"
              fontWeight="600"
            >
              School
            </text>
          </g>

          {/* Fleet buses (for admin view) */}
          {showFleet &&
            FLEET_BUSES.filter((bus) => bus.id !== "b1").map((bus) => {
              const pos = toSVG(bus.position.lat, bus.position.lng);
              const color = bus.status === "delayed" ? "#EF4444" : "#2E8BFF";
              return (
                <g key={bus.id} transform={`translate(${pos.x} ${pos.y})`} opacity="0.75">
                  <circle r="2.2" fill={color} opacity="0.2" />
                  <circle r="1" fill={color} />
                  <text x="0" y="-2.5" textAnchor="middle" fill="white" fontSize="1.8" opacity="0.9">
                    {bus.number}
                  </text>
                </g>
              );
            })}

          {/* Main bus — animated */}
          <motion.g
            animate={{ x: busSVG.x, y: busSVG.y }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            filter="url(#bus-glow)"
          >
            {/* Outer pulse */}
            <motion.circle
              r="4"
              fill="#FFC247"
              opacity="0.15"
              animate={{ r: [4, 7, 4], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            {/* Mid ring */}
            <circle r="2.2" fill="none" stroke="#FFC247" strokeWidth="0.5" opacity="0.5" />
            {/* Core */}
            <circle r="1.6" fill="#FFC247" />
            <circle r="1.6" fill="none" stroke="white" strokeWidth="0.4" opacity="0.8" />

            {/* Bus label pill */}
            <g transform="translate(0, -6)">
              <rect x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#FFC247" opacity="0.95" />
              <text
                x="0"
                y="0.8"
                textAnchor="middle"
                fill="#071225"
                fontSize="2.8"
                fontWeight="bold"
              >
                SB-12
              </text>
            </g>
          </motion.g>
        </svg>

        {/* Rain effect */}
        {demo.isRaining && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 4.3 + Math.random() * 5) % 100}%`,
                  top: -10,
                  width: 1,
                  height: 12 + (i % 4) * 3,
                  background: "linear-gradient(180deg, transparent, rgba(100,160,255,0.5))",
                }}
                animate={{ y: ["0vh", "110vh"] }}
                transition={{
                  duration: 0.5 + (i % 5) * 0.07,
                  repeat: Infinity,
                  delay: (i % 15) * 0.03,
                  ease: "linear",
                }}
              />
            ))}
            {/* Rain fog overlay */}
            <div className="absolute inset-0 bg-[rgba(60,100,160,0.05)] backdrop-blur-[0.5px]" />
          </div>
        )}

        {/* District name labels */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {DISTRICTS.map((d) => (
            <text
              key={d.label}
              x={d.x + d.w / 2}
              y={d.y + d.h / 2}
              textAnchor="middle"
              fill="rgba(255,255,255,0.12)"
              fontSize="2.8"
              fontWeight="600"
              letterSpacing="0.3"
              style={{ userSelect: "none", textTransform: "uppercase" }}
            >
              {d.label}
            </text>
          ))}
        </svg>

        {/* Map type badge */}
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] text-white/50 font-medium backdrop-blur-xl select-none">
          {mapStyle === "satellite" ? "🛰 Satellite" : "🗺 Street Map"} • Delhi NCR
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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

      {/* Scale bar */}
      <div className="absolute bottom-20 left-4 flex items-center gap-2 opacity-50">
        <div className="h-px w-12 bg-white" />
        <span className="text-[9px] text-white">500m</span>
      </div>

      {/* Bottom status card */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto">
        <motion.div
          className="rounded-[22px] bg-card/92 backdrop-blur-xl border border-white/10 p-4 inline-flex items-center gap-4 shadow-float"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {/* Bus icon */}
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center relative">
            <span className="text-lg">🚌</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-card animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-white/40">
              SB-12 • {demo.speed} km/h
            </p>
            <p className="text-sm font-semibold text-white">
              ETA: <span className="text-accent">{demo.eta} min</span>
            </p>
          </div>
          <div className="flex gap-1.5">
            {demo.trafficLevel === "heavy" && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/20 border border-danger/30 text-danger font-medium">
                Traffic
              </span>
            )}
            {demo.isRaining && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary font-medium">
                Rain
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 border border-success/30 text-success font-medium">
              Live
            </span>
          </div>
        </motion.div>
      </div>

      {/* GPS lost warning */}
      {!demo.gpsConnected && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-danger/20 border border-danger/30 text-danger text-xs font-medium animate-pulse">
          GPS Signal Lost
        </div>
      )}

      {/* Traffic legend */}
      <AnimatePresence>
        {showTraffic && demo.trafficLevel !== "low" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-4 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-xl border border-white/10 text-xs text-white/60 flex items-center gap-2"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: demo.trafficLevel === "heavy" ? "#EF4444" : "#F59E0B" }}
            />
            {demo.trafficLevel === "heavy" ? "Heavy traffic on route" : "Moderate traffic"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

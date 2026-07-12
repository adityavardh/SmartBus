"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore } from "@/store";
import { CURRENT_BUS, CURRENT_DRIVER, WEATHER, TRIP_TIMELINE } from "@/data/mock";
import type { TripEvent } from "@/types";
import { useAnimatedCounter } from "@/hooks/use-animations";
import { getGreeting, formatETA, formatDistance, formatSpeed, speak } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bus,
  Clock,
  Gauge,
  MapPin,
  Users,
  Thermometer,
  Fuel,
  Battery,
  Signal,
  Star,
  Phone,
  Share2,
  Navigation,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardHero() {
  const { demo } = useDemoStore();
  const eta = useAnimatedCounter(demo.eta);
  const speed = useAnimatedCounter(demo.speed);
  const attendance = useAnimatedCounter(demo.attendance);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          {getGreeting()}, Adi 👋
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white/50">{WEATHER.icon} {WEATHER.temp}°C</span>
          <span className="text-white/30">•</span>
          <span className="text-white/50">{WEATHER.condition}</span>
        </div>
      </motion.div>

      {/* Main bus card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card glow float className="overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-6 sm:p-7 relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bus className="w-5 h-5 text-accent" />
                  <span className="text-sm text-white/50">Current Bus</span>
                </div>
                <h2 className="text-3xl font-bold text-white">{CURRENT_BUS.number}</h2>
                <p className="text-sm text-white/45 mt-1">{CURRENT_DRIVER.name} • {CURRENT_DRIVER.rating}★ • Route A</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold text-success">Running</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBlock icon={<Clock className="w-4 h-4 text-accent" />} label="ETA" value={formatETA(eta)} highlight />
              <StatBlock icon={<MapPin className="w-4 h-4 text-primary" />} label="Distance" value={formatDistance(demo.distance)} />
              <StatBlock icon={<Gauge className="w-4 h-4 text-success" />} label="Speed" value={formatSpeed(speed)} />
              <StatBlock icon={<Users className="w-4 h-4 text-primary" />} label="Onboard" value={`${attendance} Students`} />
            </div>

            <div className="mt-6 flex items-center gap-4 p-4 rounded-[22px] bg-white/6 border border-white/10">
              <Avatar className="w-12 h-12 ring-2 ring-accent/30">
                <AvatarImage src={CURRENT_DRIVER.photo} />
                <AvatarFallback>RS</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{CURRENT_DRIVER.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-xs text-white/50">{CURRENT_DRIVER.rating} • Driver</span>
                </div>
              </div>
              <Link href="/map">
                <Button variant="accent" size="sm">
                  <Navigation className="w-4 h-4" />
                  Track Live
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-3 rounded-2xl bg-white/5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-accent" : "text-white"}`}>{value}</p>
    </div>
  );
}

export function LiveBusCard() {
  const { demo } = useDemoStore();
  const bus = CURRENT_BUS;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [calling, setCalling] = useState(false);

  const handleShare = () => {
    setCopied(true);
    speak("Location link copied to clipboard.", true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    setCalling(true);
    speak(`Dialing driver ${CURRENT_DRIVER.name}`, true);
    setTimeout(() => setCalling(false), 4000);
  };

  return (
    <>
      <Card float>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Live Bus Telemetry</h3>
              <p className="text-xs text-white/40">Real-time status updates</p>
            </div>
            <button
              className="text-xs px-3 py-1 rounded-full bg-white/6 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            >
              Auto-updating
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <MetricItem icon={<Fuel className="w-4 h-4" />} label="Fuel" value={`${bus.fuel}%`} progress={bus.fuel} color="bg-accent" />
            <MetricItem icon={<Battery className="w-4 h-4" />} label="Battery" value={`${bus.battery}%`} progress={bus.battery} color="bg-success" />
            <MetricItem icon={<Signal className="w-4 h-4" />} label="Signal" value={`${bus.networkSignal}/5`} progress={bus.networkSignal * 20} color="bg-primary" />
            <MetricItem icon={<Gauge className="w-4 h-4" />} label="Speed" value={`${demo.speed} km/h`} />
            <MetricItem icon={<MapPin className="w-4 h-4" />} label="Distance" value={`${demo.distance} KM`} />
            <MetricItem icon={<Thermometer className="w-4 h-4" />} label="Temp" value={`${bus.temperature}°C`} />
            <MetricItem icon={<Users className="w-4 h-4" />} label="Occupancy" value={`${demo.attendance}/${bus.capacity}`} progress={(demo.attendance / bus.capacity) * 100} color="bg-primary" />
            <MetricItem
              icon={<Star className="w-4 h-4" />}
              label="Engine"
              value={bus.engine === "healthy" ? "Optimal" : "Warning"}
              progress={bus.engine === "healthy" ? 100 : 45}
              color={bus.engine === "healthy" ? "bg-success" : "bg-danger"}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="glass" className="flex-1" onClick={handleCall}>
              <Phone className="w-4 h-4" />
              {calling ? "Dialing..." : "Call Driver"}
            </Button>
            <Button variant="glass" className="flex-1" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              {copied ? "Link Copied!" : "Share Live Location"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(true)}>
              View Bus Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bus Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-xl rounded-[32px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float p-6 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[18px] bg-accent/20 flex items-center justify-center border border-accent/20 text-xl">
                    🚌
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Vehicle Blueprint & Details</h2>
                    <p className="text-xs text-white/40">Specifications & Maintenance Log</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bus illustration drawing */}
              <div className="rounded-2xl border border-white/6 bg-[#071225]/60 p-4 mb-5 flex justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,194,71,0.06),transparent_65%)]" />
                <svg width="260" height="120" viewBox="0 0 400 180" className="relative z-10 opacity-95">
                  <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <rect x="40" y="40" width="320" height="90" rx="20" fill="#FFC247" />
                    {/* Glass windows */}
                    <rect x="60" y="55" width="45" height="35" rx="8" fill="#071225" opacity="0.3" />
                    <rect x="120" y="55" width="45" height="35" rx="8" fill="#071225" opacity="0.3" />
                    <rect x="180" y="55" width="45" height="35" rx="8" fill="#071225" opacity="0.3" />
                    <rect x="240" y="55" width="45" height="35" rx="8" fill="#071225" opacity="0.3" />
                    <rect x="300" y="55" width="40" height="35" rx="8" fill="#071225" opacity="0.3" />
                    {/* Wheels */}
                    <circle cx="100" cy="135" r="22" fill="#111827" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    <circle cx="100" cy="135" r="8" fill="#9CA3AF" />
                    <circle cx="300" cy="135" r="22" fill="#111827" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                    <circle cx="300" cy="135" r="8" fill="#9CA3AF" />
                    {/* Details */}
                    <rect x="350" y="70" width="10" height="40" rx="3" fill="#071225" />
                    <circle cx="355" cy="80" r="2.5" fill="#FFF2C2" />
                    <line x1="40" y1="95" x2="360" y2="95" stroke="#FFFFFF" strokeWidth="2" opacity="0.15" />
                    <text x="200" y="102" textAnchor="middle" fill="#071225" fontSize="12" fontWeight="800" letterSpacing="2" opacity="0.6">
                      SMARTBUS
                    </text>
                  </motion.g>
                </svg>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                <DetailRow label="Registration No" value={bus.registration} />
                <DetailRow label="Total Capacity" value={`${bus.capacity} Seats`} />
                <DetailRow label="Insurance Status" value={bus.insurance} highlight />
                <DetailRow label="Last Service Date" value={bus.lastService} />
                <DetailRow label="Accumulated Mileage" value={`${bus.mileage.toLocaleString()} KM`} />
                <DetailRow label="Health Score" value="Excellent (98%)" highlight />
                <DetailRow label="Diagnostics" value="Healthy (0 Faults)" />
                <DetailRow label="Next Service Due" value="15 Sep 2026 (770 KM)" />
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                  ✓
                </div>
                <p className="text-xs text-white/60">
                  This vehicle meets all safety criteria. GPS sensors, brake wear indicators, and cabin climate controls are fully functional.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-[16px] bg-white/4 border border-white/6">
      <p className="text-xs text-white/40">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? "text-success" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function MetricItem({
  icon,
  label,
  value,
  progress,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  progress?: number;
  color?: string;
}) {
  return (
    <div className="p-3 rounded-[18px] bg-white/6 border border-white/10">
      <div className="flex items-center gap-2 text-white/40 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-white">{value}</p>
      {progress !== undefined && (
        <Progress value={progress} className="mt-2 h-1" indicatorClassName={color} />
      )}
    </div>
  );
}

export function ETACountdown() {
  const { demo } = useDemoStore();

  return (
    <Card glow>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-white/40 mb-2">Bus arriving in</p>
        <motion.div
          key={demo.eta}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-accent mb-2"
        >
          {demo.eta}
        </motion.div>
        <p className="text-sm text-white/50">minutes</p>
        <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent via-primary to-success"
            initial={{ width: `${Math.max(20, 100 - demo.eta * 10)}%` }}
            animate={{ width: `${Math.max(20, 100 - demo.eta * 10)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        {demo.trafficLevel === "heavy" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-accent mt-3 px-3 py-1 rounded-full bg-accent/10 inline-block"
          >
            +2 min due to traffic
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}

export function TripTimeline() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Live Timeline</h3>
        <div className="space-y-0">
          {TRIP_TIMELINE.map((event: TripEvent, i: number) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.status === "completed"
                      ? "bg-success"
                      : event.status === "current"
                      ? "bg-accent animate-pulse"
                      : "bg-white/20"
                  }`}
                />
                {i < TRIP_TIMELINE.length - 1 && (
                  <div className={`w-px flex-1 min-h-[40px] ${event.status === "completed" ? "bg-success/30" : "bg-white/10"}`} />
                )}
              </div>
              <div className="pb-6">
                <p className="text-xs text-white/40">{event.time}</p>
                <p className={`text-sm font-medium ${event.status === "current" ? "text-accent" : "text-white"}`}>
                  {event.title}
                </p>
                <p className="text-xs text-white/40">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

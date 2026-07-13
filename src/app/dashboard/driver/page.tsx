"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MAIN_ROUTE, CURRENT_BUS } from "@/data/mock";
import { useAuthStore } from "@/store";
import { getGreeting } from "@/lib/utils";
import {
  Play,
  Square,
  Coffee,
  AlertTriangle,
  Fuel,
  QrCode,
  Navigation,
  ClipboardList,
  Users,
  MapPin,
  Clock
} from "lucide-react";

export default function DriverDashboard() {
  const { user } = useAuthStore();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const [tripStatus, setTripStatus] = useState<"idle" | "in_progress" | "completed">("idle");
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

  const showToast = (message: string, color: string) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartTrip = () => {
    if (tripStatus === "in_progress") return;
    setTripStatus("in_progress");
    showToast("🟢 Trip started — SB-12 is now en route", "bg-success/20 border-success/30 text-success");
  };

  const handleEndTrip = () => {
    if (tripStatus !== "in_progress") return;
    setTripStatus("completed");
    showToast("✅ Trip ended — Route complete. Have a great day!", "bg-primary/20 border-primary/30 text-primary");
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{getGreeting()}, {user.name}</h1>
            <p className="text-white/50">{date} • {MAIN_ROUTE.name}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold text-accent">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </motion.div>

        {/* Trip controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ActionButton
            icon={<Play className="w-6 h-6" />}
            label="Start Trip"
            color={tripStatus === "in_progress"
              ? "bg-success/30 text-success border-success/50 cursor-not-allowed opacity-60"
              : "bg-success/20 text-success border-success/30 hover:bg-success/30"}
            onClick={handleStartTrip}
            disabled={tripStatus === "in_progress" || tripStatus === "completed"}
          />
          <ActionButton
            icon={<Square className="w-6 h-6" />}
            label="End Trip"
            color={tripStatus !== "in_progress"
              ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed opacity-50"
              : "bg-danger/20 text-danger border-danger/30 hover:bg-danger/30"}
            onClick={handleEndTrip}
            disabled={tripStatus !== "in_progress"}
          />
          <ActionButton icon={<Coffee className="w-6 h-6" />} label="Take Break" color="bg-white/5 text-white/50 border-white/10 hover:bg-white/10" onClick={() => showToast("☕ Break logged", "bg-white/10 border-white/20 text-white")} />
          <ActionButton icon={<AlertTriangle className="w-6 h-6" />} label="Emergency SOS" color="bg-danger/20 text-danger border-danger/30 hover:bg-danger/30" onClick={() => showToast("🚨 SOS alert sent to dispatch!", "bg-danger/20 border-danger/30 text-danger")} />
        </div>

        {/* Trip Status indicator */}
        {tripStatus !== "idle" && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium ${
            tripStatus === "completed" ? "bg-primary/10 border-primary/30 text-primary" : "bg-success/10 border-success/30 text-success"
          }`}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: tripStatus === "completed" ? "#2E8BFF" : "#22C55E" }} />
            {tripStatus === "in_progress" ? "Trip In Progress — SB-12 is live on Route A" : "Trip Completed — Route A finished"}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Live Route Progress
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                    tripStatus === "in_progress" ? "bg-success/20 text-success border-success/20" :
                    tripStatus === "completed" ? "bg-primary/20 text-primary border-primary/20" :
                    "bg-accent/20 text-accent border-accent/20"
                  }`}>
                    {tripStatus === "in_progress" ? "In Progress" : tripStatus === "completed" ? "Completed" : "Standby"}
                  </span>
                </div>
                
                <div className="relative pl-6 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-white/10">
                  {MAIN_ROUTE.stops.map((stop) => (
                    <div key={stop.id} className="relative flex items-center gap-4">
                      <div className={`absolute -left-6 w-3 h-3 rounded-full border-2 ${
                        stop.status === 'completed' ? 'bg-success border-success' : 
                        stop.status === 'current' ? 'bg-accent border-accent shadow-[0_0_10px_rgba(255,194,71,0.5)]' : 
                        'bg-card border-white/30'
                      }`} />
                      
                      <div className={`flex-1 p-4 rounded-2xl border transition-colors ${
                        stop.status === 'current' ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className={`font-semibold ${stop.status === 'current' ? 'text-accent' : 'text-white'}`}>
                            {stop.name}
                          </p>
                          <span className="text-xs text-white/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {stop.time}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          {stop.studentsWaiting} students waiting
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Vehicle Telemetry</h3>
                <div className="space-y-5">
                  <StatusBar icon={<Fuel className="w-4 h-4" />} label="Fuel Level" value={CURRENT_BUS.fuel} color="bg-accent" />
                  <StatusBar icon={<span>🔋</span>} label="Battery Health" value={CURRENT_BUS.battery} color="bg-success" />
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-white/60">Engine Status</span>
                    <span className="text-sm font-semibold text-success bg-success/20 px-3 py-1 rounded-full">Optimal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon={<QrCode className="w-6 h-6" />} label="Scanner" />
              <QuickAction icon={<Navigation className="w-6 h-6" />} label="Navigate" />
              <QuickAction icon={<Users className="w-6 h-6" />} label="Manifest" />
              <QuickAction icon={<ClipboardList className="w-6 h-6" />} label="Report" />
            </div>
          </div>
        </div>
      </div>
      <MobileNav />

      {/* Toast feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-float text-sm font-semibold ${toast.color}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function ActionButton({ icon, label, color, onClick, disabled }: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${color}`}
    >
      {icon}
      <span className="text-sm font-bold">{label}</span>
    </motion.button>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Button variant="glass" className="h-24 flex-col gap-3 rounded-2xl bg-white/5 hover:bg-white/10">
      <div className="text-accent">{icon}</div>
      <span className="text-xs font-medium text-white">{label}</span>
    </Button>
  );
}

function StatusBar({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-white/60">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <Progress value={value} indicatorClassName={color} className="h-2 bg-white/10" />
    </div>
  );
}

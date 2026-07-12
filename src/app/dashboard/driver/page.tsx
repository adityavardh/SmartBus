"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MAIN_ROUTE, CURRENT_BUS, DRIVER_USER } from "@/data/mock";
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
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Good Morning, {DRIVER_USER.name}</h1>
            <p className="text-white/50">{date} • {MAIN_ROUTE.name}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold text-accent">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </motion.div>

        {/* Trip controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ActionButton icon={<Play className="w-6 h-6" />} label="Start Trip" color="bg-success/20 text-success border-success/30 hover:bg-success/30" />
          <ActionButton icon={<Square className="w-6 h-6" />} label="End Trip" color="bg-white/5 text-white/50 border-white/10 hover:bg-white/10" />
          <ActionButton icon={<Coffee className="w-6 h-6" />} label="Take Break" color="bg-white/5 text-white/50 border-white/10 hover:bg-white/10" />
          <ActionButton icon={<AlertTriangle className="w-6 h-6" />} label="Emergency SOS" color="bg-danger/20 text-danger border-danger/30 hover:bg-danger/30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Live Route Progress
                  </h3>
                  <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-medium rounded-full border border-accent/20">
                    In Progress
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
    </AppLayout>
  );
}

function ActionButton({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
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

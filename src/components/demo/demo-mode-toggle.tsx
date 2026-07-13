"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoStore, useNotificationStore, useSettingsStore } from "@/store";
import { speak } from "@/lib/utils";
import confetti from "canvas-confetti";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  CloudRain,
  Sun,
  Wifi,
  WifiOff,
  RotateCcw,
  Sliders,
  AlertOctagon,
  School,
  Globe,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function DemoModeToggle() {
  const { demo, setDemoEnabled, updateDemo } = useDemoStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceAnnouncements);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname !== "/dashboard/admin" && pathname !== "/dashboard/driver") return null;

  const toggleRain = (checked: boolean) => {
    updateDemo({ isRaining: checked });
    addNotification({
      type: checked ? "delay" : "bus_started",
      title: checked ? "Rain Mode Active" : "Clear Weather",
      message: checked ? "Speed reduced, ETA increased by 3 min" : "Optimal driving conditions restored",
    });
    if (checked) {
      updateDemo({ eta: demo.eta + 3, speed: Math.max(15, demo.speed - 15) });
      speak("Rain mode activated. Slowing down for safety.", voiceEnabled);
    } else {
      updateDemo({ eta: Math.max(1, demo.eta - 3), speed: Math.min(60, demo.speed + 15) });
      speak("Rain has cleared.", voiceEnabled);
    }
  };

  const handleTrafficChange = (level: "low" | "medium" | "heavy") => {
    updateDemo({ trafficLevel: level });
    let etaChange = 0;
    let speedVal = 38;
    let title = "Traffic cleared";
    let desc = "Road is clear";

    if (level === "medium") {
      etaChange = 1;
      speedVal = 24;
      title = "Moderate Traffic";
      desc = "Slow moving traffic near Saket";
    } else if (level === "heavy") {
      etaChange = 3;
      speedVal = 12;
      title = "Heavy Traffic Congestion";
      desc = "Gridlock on main bypass, alternate route planned";
    }

    updateDemo({ eta: demo.eta + etaChange, speed: speedVal });
    addNotification({
      type: "traffic",
      title: title,
      message: desc,
    });
    speak(desc, voiceEnabled);
  };

  const toggleGPS = (connected: boolean) => {
    updateDemo({ gpsConnected: connected });
    addNotification({
      type: connected ? "bus_started" : "sos",
      title: connected ? "GPS Link Re-established" : "GPS Signal Lost",
      message: connected ? "Syncing location trackers" : "Driver location offline. Reconnecting...",
    });
    speak(connected ? "GPS signal restored." : "Alert. GPS tracker connection lost.", voiceEnabled);
  };

  const toggleOffline = (offline: boolean) => {
    updateDemo({ simulatedOffline: offline });
    speak(offline ? "Network connection lost. Offline cached mode." : "Online syncing enabled.", voiceEnabled);
  };

  const toggleSchoolClosed = (closed: boolean) => {
    updateDemo({ schoolClosed: closed });
    addNotification({
      type: closed ? "sos" : "bus_started",
      title: closed ? "School Closed" : "School Operational",
      message: closed ? "Emergency announcement: School closed due to bad weather" : "Regular schedule resumes",
    });
    speak(closed ? "Attention. School is closed today." : "Regular schedule has resumed.", voiceEnabled);
  };

  const triggerEmergency = () => {
    addNotification({
      type: "sos",
      title: "SOS Alert Received",
      message: "Emergency broadcast initiated. Police and medics notified.",
    });
    speak("S O S alert active. Directing assistance to your location.", true);
    confetti({
      particleCount: 150,
      spread: 120,
      colors: ["#EF4444", "#FFFFFF"],
    });
  };

  const resetTrip = () => {
    updateDemo({
      busProgress: 0.1,
      eta: 8,
      speed: 38,
      distance: 3.5,
      attendance: 12,
      trafficLevel: "low",
      isRaining: false,
      tripStarted: true,
      tripCompleted: false,
      gpsConnected: true,
      simulatedOffline: false,
      schoolClosed: false,
    });
    addNotification({
      type: "bus_started",
      title: "Trip Reset Completed",
      message: "Simulation route initialized to depot",
    });
    speak("Simulation reset to start of route.", voiceEnabled);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 xl:bottom-6 xl:right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full border backdrop-blur-xl transition-all shadow-float ${
          demo.enabled
            ? "bg-accent/20 border-accent/40 text-accent shadow-glow-accent"
            : "bg-card/80 border-white/10 text-white/60 hover:text-white"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className={`w-4 h-4 ${demo.enabled ? "animate-pulse" : ""}`} />
        <span className="text-xs font-semibold">
          Simulation {demo.enabled ? "Active" : "Deck"}
        </span>
        <Sliders className="w-3.5 h-3.5 opacity-60 ml-0.5" />
      </motion.button>

      {/* Slide-out Control Center */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-md rounded-[32px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float p-6 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[18px] bg-accent/20 flex items-center justify-center border border-accent/20">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Simulation Deck</h2>
                    <p className="text-xs text-white/40">Hackathon Developer Controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Auto Play */}
                <div className="flex items-center justify-between p-3.5 rounded-[20px] bg-white/5 border border-white/8">
                  <div>
                    <Label className="text-sm font-semibold text-white">Auto-Play Route</Label>
                    <p className="text-xs text-white/40">Automatically drive bus on schedule</p>
                  </div>
                  <Switch checked={demo.enabled} onCheckedChange={setDemoEnabled} />
                </div>

                {/* Progress Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white/40">Bus Progress</span>
                    <span className="text-accent font-semibold">{Math.round(demo.busProgress * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    disabled={demo.enabled}
                    value={demo.busProgress}
                    onChange={(e) => updateDemo({ busProgress: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full bg-white/10 accent-accent cursor-pointer disabled:opacity-40"
                  />
                  <p className="text-[10px] text-white/30 italic">Disable auto-play to adjust route coordinates manually</p>
                </div>

                {/* Weather & Traffic Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-white/4 border border-white/8 space-y-3">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Weather</Label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRain(false)}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all ${
                          !demo.isRaining
                            ? "bg-accent/15 border-accent/30 text-accent"
                            : "bg-white/4 border-transparent text-white/40"
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        Sunny
                      </button>
                      <button
                        onClick={() => toggleRain(true)}
                        className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-all ${
                          demo.isRaining
                            ? "bg-primary/20 border-primary/30 text-primary"
                            : "bg-white/4 border-transparent text-white/40"
                        }`}
                      >
                        <CloudRain className="w-3.5 h-3.5" />
                        Rainy
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/4 border border-white/8 space-y-3">
                    <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider block">Traffic</Label>
                    <div className="flex gap-1">
                      {(["low", "medium", "heavy"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => handleTrafficChange(t)}
                          className={`flex-1 py-1.5 rounded-xl border text-[10px] font-semibold transition-all capitalize ${
                            demo.trafficLevel === t
                              ? t === "heavy"
                                ? "bg-danger/20 border-danger/30 text-danger"
                                : t === "medium"
                                ? "bg-accent/20 border-accent/30 text-accent"
                                : "bg-success/20 border-success/30 text-success"
                              : "bg-white/4 border-transparent text-white/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Toggles */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Simulate Anomalies</Label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {/* GPS Signal */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/4 border border-white/6">
                      <div className="flex items-center gap-2">
                        {demo.gpsConnected ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-danger animate-pulse" />}
                        <span className="text-xs font-medium text-white">GPS Signal Link</span>
                      </div>
                      <Switch checked={demo.gpsConnected} onCheckedChange={toggleGPS} />
                    </div>

                    {/* Offline mode */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/4 border border-white/6">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-white">Simulate Offline Mode</span>
                      </div>
                      <Switch checked={demo.simulatedOffline} onCheckedChange={toggleOffline} />
                    </div>

                    {/* School operational */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/4 border border-white/6">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-accent" />
                        <span className="text-xs font-medium text-white">School Closed Banner</span>
                      </div>
                      <Switch checked={demo.schoolClosed} onCheckedChange={toggleSchoolClosed} />
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={resetTrip}
                    className="flex-1 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Route
                  </button>
                  <button
                    onClick={triggerEmergency}
                    className="flex-1 h-11 rounded-2xl bg-danger hover:bg-danger-hover text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_12px_30px_rgba(239,68,68,0.25)] border border-danger/30"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Trigger SOS Alert
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

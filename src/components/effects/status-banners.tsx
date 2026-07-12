"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X, CloudRain, WifiOff, Navigation, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/store";

export function StatusBanners() {
  const { demo } = useDemoStore();
  const [holidayDismissed, setHolidayDismissed] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!holidayDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[60] px-4 pt-3 pointer-events-none"
          >
            <div className="mx-auto max-w-4xl pointer-events-auto rounded-[20px] bg-gradient-to-r from-accent/20 to-primary/20 border border-white/10 p-3 flex items-center gap-3 backdrop-blur-xl shadow-float">
              <PartyPopper className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Summer Break Schedule Active</p>
                <p className="text-xs text-white/50">Modified routes in effect until July 20</p>
              </div>
              <button onClick={() => setHolidayDismissed(true)} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo.isRaining && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 left-4 z-[55] flex items-center gap-2 rounded-full border border-primary/30 bg-primary/15 px-4 py-2 backdrop-blur-xl"
          >
            <CloudRain className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Rain Mode — ETA adjusted</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo.enabled && demo.trafficLevel === "heavy" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-4 z-[55] flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-4 py-2 backdrop-blur-xl"
          >
            <Navigation className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-accent">Traffic Mode Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!demo.gpsConnected && (
          <GPSReconnecting />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo.simulatedOffline && (
          <OfflineBanner />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {demo.schoolClosed && (
          <SchoolClosedBanner />
        )}
      </AnimatePresence>
    </>
  );
}

export function HolidayBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-4 lg:mx-8 mt-4 rounded-[24px] bg-gradient-to-r from-accent/20 to-primary/20 border border-white/10 p-4 flex items-center gap-3 backdrop-blur-xl shadow-float"
    >
      <PartyPopper className="w-5 h-5 text-accent shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Summer Break Schedule Active</p>
        <p className="text-xs text-white/50">Modified routes in effect until July 20</p>
      </div>
      <button onClick={() => setVisible(false)} className="text-white/30 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function OfflineBanner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-[200] bg-danger/90 backdrop-blur-sm text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4" />
      You&apos;re offline — showing cached data
    </motion.div>
  );
}

export function GPSReconnecting() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center rounded-[28px] border border-white/10 bg-card/90 backdrop-blur-2xl p-8 shadow-float"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4"
        />
        <p className="text-white font-semibold text-lg">Reconnecting to GPS...</p>
        <p className="text-white/40 text-sm mt-1">Finding nearest bus signal</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SchoolClosedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-0 left-0 right-0 z-[200] bg-danger text-white text-center py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-lg"
    >
      <AlertTriangle className="w-4 h-4 animate-bounce" />
      <span>School Closed Status Active — Regular school transport schedule suspended</span>
    </motion.div>
  );
}

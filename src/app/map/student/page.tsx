"use client";

import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { LiveMap } from "@/components/map/live-map";
import { LiveBusCard } from "@/components/dashboard/dashboard-cards";
import { motion } from "framer-motion";

export default function StudentMapPage() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Live GPS Tracking</h1>
          <p className="text-white/50">Track your assigned bus in real-time</p>
        </motion.div>

        <LiveMap fullscreen />

        <LiveBusCard />
      </div>
      <MobileNav />
    </AppLayout>
  );
}

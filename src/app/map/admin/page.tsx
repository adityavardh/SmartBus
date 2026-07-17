"use client";

import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { LiveMap } from "@/components/map/live-map";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationStore, selectAdminStats } from "@/store/locationStore";

export default function AdminMapPage() {
  const stats = useLocationStore(selectAdminStats);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Fleet Live Map</h1>
          <p className="text-white/50">
            Global telemetry view of all active vehicles
          </p>
        </motion.div>

        <LiveMap fullscreen showFleet />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {stats.totalBuses}
              </p>
              <p className="text-xs text-white/50">Total Fleet</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">
                {stats.runningBuses}
              </p>
              <p className="text-xs text-white/50">Running</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {stats.delayedBuses}
              </p>
              <p className="text-xs text-white/50">Delayed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-danger">
                {stats.offlineBuses}
              </p>
              <p className="text-xs text-white/50">Offline GPS</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

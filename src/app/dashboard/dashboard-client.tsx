"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { DashboardHero, LiveBusCard, ETACountdown, TripTimeline } from "@/components/dashboard/dashboard-cards";
import { LiveMap } from "@/components/map/live-map";
import { GPSLoader } from "@/components/effects/loaders";
import { useLoader } from "@/hooks/use-animations";
import { useAppStore, useDemoStore } from "@/store";
import { motion } from "framer-motion";
import { DEFAULT_DEMO } from "@/data/mock";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const loaderComplete = useAppStore((s) => s.loaderComplete);
  const setLoaderComplete = useAppStore((s) => s.setLoaderComplete);
  const { demo, setDemoEnabled, updateDemo } = useDemoStore();
  const [loaded, setLoaded] = useState(loaderComplete);

  const onComplete = useCallback(() => {
    setLoaderComplete(true);
    setLoaded(true);
  }, [setLoaderComplete]);

  const { message } = useLoader(loaderComplete ? undefined : onComplete);

  useEffect(() => {
    if (searchParams.get("demo") === "true" && !demo.enabled) {
      updateDemo({ ...DEFAULT_DEMO, enabled: false, busProgress: 0.05 });
      setDemoEnabled(true);
    }
  }, [searchParams, demo.enabled, setDemoEnabled, updateDemo]);

  if (!loaded && !loaderComplete) {
    return <GPSLoader message={message} />;
  }

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <DashboardHero />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiveMap />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LiveBusCard />
          </div>
          <div className="space-y-6">
            <ETACountdown />
            <TripTimeline />
          </div>
        </div>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

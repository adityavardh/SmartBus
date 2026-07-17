"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationStore, selectAdminStats } from "@/store/locationStore";
import { LiveMap } from "@/components/map/live-map";
import {
  Bus,
  Users,
  Wifi,
  AlertCircle,
  Activity,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const stats = useLocationStore(selectAdminStats);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Fleet Command Center
            </h1>
            <p className="text-white/50">
              System-wide monitoring &amp; diagnostics
            </p>
          </div>
          <div className="hidden lg:flex gap-3">
            <Button
              variant="glass"
              className="border-danger/30 text-danger hover:bg-danger/20"
            >
              <AlertCircle className="w-4 h-4 mr-2" /> Broadcast Alert
            </Button>
          </div>
        </motion.div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Bus className="w-5 h-5 text-primary" />}
            label="Total Fleet"
            value={String(stats.totalBuses)}
            subValue={`${stats.runningBuses} Active`}
          />
          <StatCard
            icon={<Users className="w-5 h-5 text-success" />}
            label="Students"
            value={String(stats.studentsOnboard)}
            subValue={`of ${stats.totalStudents} Expected`}
          />
          <StatCard
            icon={<Truck className="w-5 h-5 text-accent" />}
            label="Active Drivers"
            value={String(stats.activeDrivers)}
            subValue={`of ${stats.totalDrivers} Total`}
          />
          <StatCard
            icon={<Wifi className="w-5 h-5 text-primary" />}
            label="GPS Health"
            value={`${stats.gpsHealthPercent}%`}
            subValue={`${stats.offlineBuses} Offline`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-danger/30 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
              <CardContent className="p-0 relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-xl border border-white/10 flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                    <span className="text-xs font-semibold text-white tracking-widest uppercase">
                      Live Network
                    </span>
                  </div>
                </div>
                <div className="h-[400px]">
                  <LiveMap showFleet />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-danger" />
                  System Health
                </h3>
                <div className="space-y-4">
                  <HealthBar
                    label="Network Routing"
                    value={stats.routeHealthPercent}
                  />
                  <HealthBar
                    label="Telemetry Sync"
                    value={stats.gpsHealthPercent}
                  />
                  <HealthBar
                    label="Database Load"
                    value={24}
                    color="bg-success"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  Action Items
                </h3>
                <div className="space-y-3">
                  <ActionItem
                    icon={<Zap className="w-4 h-4 text-accent" />}
                    text={`${stats.delayedBuses} bus${stats.delayedBuses !== 1 ? "es" : ""} currently delayed`}
                  />
                  <ActionItem
                    icon={<AlertCircle className="w-4 h-4 text-danger" />}
                    text={`${stats.openComplaints} unresolved parent complaint${stats.openComplaints !== 1 ? "s" : ""}`}
                  />
                  <ActionItem
                    icon={<Wifi className="w-4 h-4 text-white/50" />}
                    text={`${stats.offlineBuses} GPS unit${stats.offlineBuses !== 1 ? "s" : ""} require restart`}
                  />
                </div>
              </CardContent>
            </Card>

            <Link href="/fleet/admin" className="block">
              <Button
                variant="glass"
                className="w-full justify-between hover:bg-white/10 border-white/10"
              >
                Manage Fleet Directory
                <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded">
                  {stats.totalBuses} Units
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue: string;
}) {
  return (
    <Card float className="border-white/5">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-white/5">{icon}</div>
          <p className="text-sm font-medium text-white/60">{label}</p>
        </div>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-xs text-white/40">{subValue}</p>
      </CardContent>
    </Card>
  );
}

function HealthBar({
  label,
  value,
  color = "bg-primary",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-sm font-bold text-white">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function ActionItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
      {icon}
      <p className="text-sm text-white/80">{text}</p>
    </div>
  );
}

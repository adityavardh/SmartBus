"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationStore, selectAdminStats } from "@/store/locationStore";
import { useNotificationStore } from "@/store";
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
  IndianRupee,
  MessageSquare,
  Route,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const stats = useLocationStore(selectAdminStats);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

  const showToast = (message: string, color: string) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    addNotification({
      type: "route_change",
      title: "Admin Broadcast",
      message: broadcastMsg.trim(),
    });
    showToast("📢 Alert broadcast to all users", "bg-danger/20 border-danger/30 text-danger");
    setBroadcastMsg("");
    setBroadcastOpen(false);
  };

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
              onClick={() => setBroadcastOpen(true)}
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
          <StatCard
            icon={<IndianRupee className="w-5 h-5 text-success" />}
            label="Revenue"
            value={`₹${(stats.revenueThisMonth / 1000).toFixed(0)}K`}
            subValue="This Month"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5 text-danger" />}
            label="Open Complaints"
            value={String(stats.openComplaints)}
            subValue="Unresolved"
          />
          <StatCard
            icon={<Route className="w-5 h-5 text-accent" />}
            label="Route Health"
            value={`${stats.routeHealthPercent}%`}
            subValue={`${stats.delayedBuses} Delayed`}
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
                  <HealthBar label="Network Routing" value={stats.routeHealthPercent} />
                  <HealthBar label="Telemetry Sync" value={stats.gpsHealthPercent} />
                  <HealthBar label="Database Load" value={24} color="bg-success" />
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
                    onClick={() => showToast("📍 Viewing delayed bus routes...", "bg-accent/20 border-accent/30 text-accent")}
                  />
                  <ActionItem
                    icon={<AlertCircle className="w-4 h-4 text-danger" />}
                    text={`${stats.openComplaints} unresolved parent complaint${stats.openComplaints !== 1 ? "s" : ""}`}
                    onClick={() => showToast("📋 Opening complaints queue...", "bg-danger/20 border-danger/30 text-danger")}
                  />
                  <ActionItem
                    icon={<Wifi className="w-4 h-4 text-white/50" />}
                    text={`${stats.offlineBuses} GPS unit${stats.offlineBuses !== 1 ? "s" : ""} require restart`}
                    onClick={() => showToast("🔄 GPS restart command sent", "bg-white/10 border-white/20 text-white")}
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

      {/* Broadcast Alert Modal */}
      <AnimatePresence>
        {broadcastOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setBroadcastOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-[28px] border border-danger/20 bg-card/95 backdrop-blur-2xl shadow-float p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-danger/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Broadcast Alert</h2>
                    <p className="text-xs text-white/40">Sends to all active users</p>
                  </div>
                </div>
                <button
                  onClick={() => setBroadcastOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Type your alert message..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBroadcast()}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button
                    variant="glass"
                    className="flex-1"
                    onClick={() => setBroadcastOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleBroadcast}
                    disabled={!broadcastMsg.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Broadcast
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-float text-sm font-semibold ${toast.color}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
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
  onClick,
}: {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors text-left"
    >
      {icon}
      <p className="text-sm text-white/80">{text}</p>
    </button>
  );
}

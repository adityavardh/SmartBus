"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { useLocationStore, selectFleetBuses } from "@/store/locationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  Wifi,
  WifiOff,
  X,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Phone,
} from "lucide-react";
import type { FleetBus } from "@/types";

type FilterStatus = "all" | "running" | "delayed" | "stopped" | "offline";

export default function AdminFleetPage() {
  const fleetBuses = useLocationStore(selectFleetBuses);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [actionBus, setActionBus] = useState<FleetBus | null>(null);
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);

  // New vehicle form state
  const [newVehicleId, setNewVehicleId] = useState("");
  const [newDriver, setNewDriver] = useState("");

  const showToast = (message: string, color: string) => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredBuses = fleetBuses.filter((bus) => {
    const matchesSearch =
      !searchQuery ||
      bus.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bus.route ?? "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === "all" || bus.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleAddVehicle = () => {
    if (!newVehicleId.trim()) return;
    showToast(`✅ Vehicle ${newVehicleId.toUpperCase()} added to fleet`, "bg-success/20 border-success/30 text-success");
    setNewVehicleId("");
    setNewDriver("");
    setAddVehicleOpen(false);
  };

  const statusColors: Record<string, string> = {
    running:   "text-success bg-success/10 border-success/20",
    stopped:   "text-white/40 bg-white/5 border-white/10",
    delayed:   "text-accent bg-accent/10 border-accent/20",
    offline:   "text-danger bg-danger/10 border-danger/20",
    completed: "text-primary bg-primary/10 border-primary/20",
  };

  const filterLabels: { value: FilterStatus; label: string }[] = [
    { value: "all",     label: "All" },
    { value: "running", label: "Running" },
    { value: "delayed", label: "Delayed" },
    { value: "stopped", label: "Stopped" },
    { value: "offline", label: "Offline" },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fleet Management</h1>
            <p className="text-white/50">Manage buses, drivers, and assignments</p>
          </div>
          <div className="hidden sm:block">
            <Button
              variant="glass"
              className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
              onClick={() => setAddVehicleOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-0">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10 flex gap-3 bg-white/5 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search fleet by ID, driver, or route..."
                  className="pl-9 bg-background/50 border-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="glass"
                className={`shrink-0 ${filterStatus !== "all" ? "border-primary/40 text-primary bg-primary/10" : ""}`}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <SlidersHorizontal className="w-4 h-4 mr-2 hidden sm:inline" /> Filter
                {filterStatus !== "all" && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20">
                    {filterLabels.find((f) => f.value === filterStatus)?.label}
                  </span>
                )}
              </Button>
            </div>

            {/* Filter pills */}
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-white/10"
                >
                  <div className="p-4 flex gap-2 flex-wrap bg-white/[0.02]">
                    {filterLabels.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => { setFilterStatus(f.value); setFilterOpen(false); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          filterStatus === f.value
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-white/40 border-b border-white/10 bg-black/20">
                    <th className="px-6 py-4">Vehicle ID</th>
                    <th className="px-6 py-4">Assigned Driver</th>
                    <th className="px-6 py-4">Active Route</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Telemetry</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBuses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/30 text-sm">
                        No vehicles match your search or filter.
                      </td>
                    </tr>
                  ) : filteredBuses.map((bus) => (
                    <tr key={bus.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{bus.number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/80">{bus.driver}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/60">{bus.route ?? "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${statusColors[bus.status] ?? statusColors.stopped}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {bus.gpsHealth ? (
                          <div className="flex items-center gap-1.5 text-success text-xs font-medium">
                            <Wifi className="w-3.5 h-3.5" /> Online
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-danger text-xs font-medium">
                            <WifiOff className="w-3.5 h-3.5" /> Offline
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-white/10"
                          onClick={() => setActionBus(bus)}
                        >
                          <MoreVertical className="w-4 h-4 text-white/40" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />

      {/* Row action sheet */}
      <AnimatePresence>
        {actionBus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            onClick={() => setActionBus(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-white text-lg">{actionBus.number}</p>
                  <p className="text-xs text-white/40">{actionBus.driver} • {actionBus.route ?? "No route"}</p>
                </div>
                <button onClick={() => setActionBus(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                <ActionSheetBtn icon={<MapPin className="w-4 h-4 text-primary" />} label="Track on Map" onClick={() => { showToast(`📍 Tracking ${actionBus.number} on map`, "bg-primary/20 border-primary/30 text-primary"); setActionBus(null); }} />
                <ActionSheetBtn icon={<Phone className="w-4 h-4 text-success" />} label="Call Driver" onClick={() => { showToast(`📞 Dialing ${actionBus.driver}...`, "bg-success/20 border-success/30 text-success"); setActionBus(null); }} />
                <ActionSheetBtn icon={<RefreshCw className="w-4 h-4 text-accent" />} label="Restart GPS Unit" onClick={() => { showToast(`🔄 GPS restart sent to ${actionBus.number}`, "bg-accent/20 border-accent/30 text-accent"); setActionBus(null); }} />
                <ActionSheetBtn icon={<CheckCircle2 className="w-4 h-4 text-white/40" />} label="Mark as Inspected" onClick={() => { showToast(`✅ ${actionBus.number} marked inspected`, "bg-white/10 border-white/20 text-white"); setActionBus(null); }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Vehicle modal */}
      <AnimatePresence>
        {addVehicleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setAddVehicleOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-[28px] border border-white/10 bg-card/95 backdrop-blur-2xl shadow-float p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-white">Add New Vehicle</h2>
                <button onClick={() => setAddVehicleOpen(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Vehicle ID (e.g. SB-25)"
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
                  autoFocus
                />
                <Input
                  placeholder="Assign Driver (optional)"
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-11"
                />
                <div className="flex gap-3 pt-1">
                  <Button variant="glass" className="flex-1" onClick={() => setAddVehicleOpen(false)}>Cancel</Button>
                  <Button
                    variant="glass"
                    className="flex-1 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    onClick={handleAddVehicle}
                    disabled={!newVehicleId.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
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
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border backdrop-blur-xl shadow-float text-sm font-semibold whitespace-nowrap ${toast.color}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function ActionSheetBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors text-left"
    >
      {icon}
      <span className="text-sm text-white/80 font-medium">{label}</span>
    </button>
  );
}

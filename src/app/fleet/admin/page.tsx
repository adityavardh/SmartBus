"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { FLEET_BUSES } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Plus, MoreVertical, Wifi, WifiOff } from "lucide-react";

export default function AdminFleetPage() {
  const statusColors = {
    running: "text-success bg-success/10 border-success/20",
    stopped: "text-white/40 bg-white/5 border-white/10",
    delayed: "text-accent bg-accent/10 border-accent/20",
    offline: "text-danger bg-danger/10 border-danger/20",
    completed: "text-primary bg-primary/10 border-primary/20",
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fleet Management</h1>
            <p className="text-white/50">Manage buses, drivers, and assignments</p>
          </div>
          <div className="hidden sm:block">
            <Button variant="glass" className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
              <Plus className="w-4 h-4 mr-2" /> Add Vehicle
            </Button>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-white/10 flex gap-4 bg-white/5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input placeholder="Search fleet by ID, driver, or route..." className="pl-9 bg-background/50 border-white/10" />
              </div>
              <Button variant="glass" className="shrink-0"><SlidersHorizontal className="w-4 h-4 mr-2 hidden sm:inline" /> Filter</Button>
            </div>
            
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
                  {FLEET_BUSES.map((bus) => (
                    <tr key={bus.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{bus.number}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/80">{bus.driver}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/60">{bus.route || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${statusColors[bus.status]}`}>
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
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
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
    </AppLayout>
  );
}

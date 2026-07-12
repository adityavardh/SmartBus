"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYTICS } from "@/data/mock";
import { BarChart3, TrendingUp, Fuel, Clock, FileDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReportsPage() {
  const totalTrips = ANALYTICS.weeklyTrips.reduce((a, b) => a + b.trips, 0);
  const avgDelay = (ANALYTICS.averageDelay.reduce((a, b) => a + b.minutes, 0) / ANALYTICS.averageDelay.length).toFixed(1);
  const totalFuel = ANALYTICS.fuelConsumption.reduce((a, b) => a + b.liters, 0);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fleet Analytics & Reports</h1>
            <p className="text-white/50">Historical data and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass"><Calendar className="w-4 h-4 mr-2" /> This Month</Button>
            <Button variant="glass" className="bg-primary/20 text-primary border-primary/30"><FileDown className="w-4 h-4 mr-2" /> Export CSV</Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<BarChart3 className="w-5 h-5 text-primary" />} label="Weekly Trips" value={String(totalTrips)} />
          <MetricCard icon={<TrendingUp className="w-5 h-5 text-success" />} label="Total Distance" value="2,480 KM" />
          <MetricCard icon={<Fuel className="w-5 h-5 text-accent" />} label="Fuel Used" value={`${totalFuel}L`} />
          <MetricCard icon={<Clock className="w-5 h-5 text-danger" />} label="Avg Delay" value={`${avgDelay} min`} />
        </div>

        <AnalyticsCharts />
      </div>
      <MobileNav />
    </AppLayout>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card float>
      <CardContent className="p-4">
        {icon}
        <p className="text-xs text-white/40 mt-2">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

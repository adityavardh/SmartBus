"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYTICS } from "@/data/mock";
import { BarChart3, TrendingUp, Fuel, Clock, FileDown, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type DateRange = "This Month" | "Last Month" | "Last 3 Months" | "This Year";

const DATE_RANGES: DateRange[] = ["This Month", "Last Month", "Last 3 Months", "This Year"];

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("This Month");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [exportToast, setExportToast] = useState(false);

  const totalTrips  = ANALYTICS.weeklyTrips.reduce((a, b) => a + b.trips, 0);
  const avgDelay    = (ANALYTICS.averageDelay.reduce((a, b) => a + b.minutes, 0) / ANALYTICS.averageDelay.length).toFixed(1);
  const totalFuel   = ANALYTICS.fuelConsumption.reduce((a, b) => a + b.liters, 0);
  const totalDistKm = ANALYTICS.monthlyDistance.reduce((a, b) => a + b.km, 0);

  const handleExportCSV = () => {
    // Build CSV from analytics data
    const rows: string[][] = [];

    rows.push(["=== SmartBus Fleet Report ===", dateRange]);
    rows.push([]);
    rows.push(["Metric", "Value"]);
    rows.push(["Total Weekly Trips", String(totalTrips)]);
    rows.push(["Total Distance (KM)", String(totalDistKm)]);
    rows.push(["Total Fuel Used (L)", String(totalFuel)]);
    rows.push(["Average Delay (min)", avgDelay]);
    rows.push([]);
    rows.push(["=== Weekly Trips ==="]);
    rows.push(["Day", "Trips"]);
    ANALYTICS.weeklyTrips.forEach((r) => rows.push([r.day, String(r.trips)]));
    rows.push([]);
    rows.push(["=== Attendance ==="]);
    rows.push(["Day", "Present", "Absent"]);
    ANALYTICS.attendance.forEach((r) => rows.push([r.day, String(r.present), String(r.absent)]));

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `smartbus-report-${dateRange.replace(/ /g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fleet Analytics &amp; Reports</h1>
            <p className="text-white/50">Historical data and performance metrics</p>
          </div>
          <div className="flex gap-2 relative">
            {/* Date range picker */}
            <div className="relative">
              <Button
                variant="glass"
                onClick={() => setDatePickerOpen((o) => !o)}
                className={datePickerOpen ? "border-primary/40 text-primary bg-primary/10" : ""}
              >
                <Calendar className="w-4 h-4 mr-2" /> {dateRange}
              </Button>
              <AnimatePresence>
                {datePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-float overflow-hidden z-30"
                  >
                    {DATE_RANGES.map((r) => (
                      <button
                        key={r}
                        onClick={() => { setDateRange(r); setDatePickerOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/8 transition-colors text-left"
                      >
                        <span className={dateRange === r ? "text-primary font-semibold" : "text-white/70"}>{r}</span>
                        {dateRange === r && <Check className="w-3.5 h-3.5 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="glass"
              className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
              onClick={handleExportCSV}
            >
              <FileDown className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon={<BarChart3 className="w-5 h-5 text-primary" />} label="Weekly Trips" value={String(totalTrips)} />
          <MetricCard icon={<TrendingUp className="w-5 h-5 text-success" />} label="Total Distance" value={`${totalDistKm.toLocaleString()} KM`} />
          <MetricCard icon={<Fuel className="w-5 h-5 text-accent" />} label="Fuel Used" value={`${totalFuel}L`} />
          <MetricCard icon={<Clock className="w-5 h-5 text-danger" />} label="Avg Delay" value={`${avgDelay} min`} />
        </div>

        <AnalyticsCharts />
      </div>
      <MobileNav />

      {/* Export toast */}
      <AnimatePresence>
        {exportToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border border-success/30 bg-success/20 backdrop-blur-xl shadow-float text-sm font-semibold text-success whitespace-nowrap"
          >
            ✅ CSV downloaded successfully
          </motion.div>
        )}
      </AnimatePresence>
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

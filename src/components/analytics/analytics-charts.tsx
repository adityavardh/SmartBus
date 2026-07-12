"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ANALYTICS } from "@/data/mock";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0D1B36",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
};

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Weekly Trips">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ANALYTICS.weeklyTrips}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="trips" fill="#2E8BFF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Distance (KM)">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={ANALYTICS.monthlyDistance}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="km" stroke="#FFC247" fill="#FFC247" fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average Delay (minutes)">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ANALYTICS.averageDelay}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="minutes" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444" }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Peak Timings">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ANALYTICS.peakTimings}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="riders" fill="#22C55E" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Student Attendance" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ANALYTICS.attendance}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="present" fill="#22C55E" radius={[8, 8, 0, 0]} stackId="a" />
            <Bar dataKey="absent" fill="#EF4444" radius={[8, 8, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}

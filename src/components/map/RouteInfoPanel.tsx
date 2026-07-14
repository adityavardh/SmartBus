"use client";

import type { BusTelemetry } from "@/types/bus";
import { Progress } from "@/components/ui/progress";
import { Bus } from "lucide-react";

interface RouteInfoPanelProps {
  telemetry: BusTelemetry;
  compact?: boolean;
}

const STATUS_LABELS: Record<BusTelemetry["status"], string> = {
  running: "Running",
  stopped: "Stopped",
  delayed: "Delayed",
  arriving: "Arriving",
};

const STATUS_COLORS: Record<BusTelemetry["status"], string> = {
  running: "text-success",
  stopped: "text-white/50",
  delayed: "text-accent",
  arriving: "text-primary",
};

export function RouteInfoPanel({ telemetry, compact }: RouteInfoPanelProps) {
  if (compact) {
    return (
      <div className="rounded-[22px] bg-card/92 backdrop-blur-xl border border-white/10 p-4 inline-flex items-center gap-4 shadow-float">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center relative">
          <Bus className="w-5 h-5 text-accent" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border-2 border-card animate-pulse" />
        </div>
        <div>
          <p className="text-xs text-white/40">
            {telemetry.busNumber} • {telemetry.speed} km/h
          </p>
          <p className="text-sm font-semibold text-white">
            ETA: <span className="text-accent">{telemetry.eta} min</span>
          </p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-success/20 border border-success/30 font-medium ${STATUS_COLORS[telemetry.status]}`}>
          {STATUS_LABELS[telemetry.status]}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] bg-card/92 backdrop-blur-xl border border-white/10 p-4 shadow-float space-y-3 min-w-[280px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-white/40">{telemetry.routeName}</p>
          <p className="text-sm font-semibold text-white">
            {telemetry.busNumber} • {telemetry.driverName}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-medium ${STATUS_COLORS[telemetry.status]}`}>
          {STATUS_LABELS[telemetry.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <InfoCell label="Current Stop" value={telemetry.currentStop} />
        <InfoCell label="Next Stop" value={telemetry.nextStop} />
        <InfoCell label="ETA" value={`${telemetry.eta} min`} highlight />
        <InfoCell label="Distance" value={`${telemetry.distanceRemaining} km`} />
        <InfoCell label="Speed" value={`${telemetry.speed} km/h`} />
        <InfoCell label="Arrival" value={telemetry.arrivalTime} />
        <InfoCell label="Passengers" value={`${telemetry.passengerCount}`} />
        <InfoCell label="Updated" value={telemetry.lastUpdated} />
      </div>

      <div>
        <div className="flex justify-between text-[10px] text-white/40 mb-1">
          <span>Trip progress</span>
          <span>{telemetry.progress}%</span>
        </div>
        <Progress value={telemetry.progress} className="h-1.5" />
      </div>
    </div>
  );
}

function InfoCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-white/5 px-2.5 py-2">
      <p className="text-white/40">{label}</p>
      <p className={`font-medium mt-0.5 ${highlight ? "text-accent" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

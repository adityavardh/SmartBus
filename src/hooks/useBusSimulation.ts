/**
 * useBusSimulation
 *
 * Computes live BusTelemetry from:
 *  - DemoStore (bus progress, speed, ETA, traffic, rain)
 *  - LocationStore (dynamic bus number, driver name, route name, stops)
 *
 * Replaces all hardcoded BUS_INFO / ROUTE_STOPS references.
 *
 * FUTURE BACKEND: Replace the mock interval with a WebSocket stream.
 */

"use client";

import { useEffect, useMemo } from "react";
import { useDemoStore } from "@/store";
import {
  useLocationStore,
  selectBus,
  selectDriver,
  selectRoute,
  selectRouteCoordinates,
} from "@/store/locationStore";
import { distanceAlongRoute, AVERAGE_BUS_SPEED_KMH } from "@/lib/animation";
import type { BusTelemetry } from "@/types/bus";
import type { BusStop } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatArrivalTime(etaMinutes: number): string {
  const arrival = new Date(Date.now() + etaMinutes * 60_000);
  return arrival.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStopsFromProgress(stops: BusStop[], progress: number) {
  const currentIndex = stops.findIndex((s) => s.status === "current");
  const idx =
    currentIndex >= 0
      ? currentIndex
      : Math.floor(progress * (stops.length - 1));

  const current = stops[Math.min(idx, stops.length - 1)];
  const next = stops[Math.min(idx + 1, stops.length - 1)];

  return {
    currentStop: current?.name ?? "Depot",
    nextStop: next?.name ?? "School",
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBusSimulation(): BusTelemetry {
  const demo = useDemoStore((s) => s.demo);
  const updateDemo = useDemoStore((s) => s.updateDemo);

  // Dynamic city data
  const bus = useLocationStore(selectBus);
  const driver = useLocationStore(selectDriver);
  const route = useLocationStore(selectRoute);
  const coordinates = useLocationStore(selectRouteCoordinates);

  const progress = demo.busProgress;

  const distanceRemaining = useMemo(
    () => Math.round(distanceAlongRoute(coordinates, progress) * 10) / 10,
    [coordinates, progress]
  );

  // Interval: recalculate ETA + speed every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const { demo: current } = useDemoStore.getState();
      if (current.tripCompleted || !current.gpsConnected) return;

      const baseEta = Math.max(0, Math.round((1 - current.busProgress) * 8));
      const trafficPenalty =
        current.trafficLevel === "heavy"
          ? 2
          : current.trafficLevel === "medium"
            ? 1
            : 0;
      const rainPenalty = current.isRaining ? 1 : 0;
      const eta = Math.max(0, baseEta + trafficPenalty + rainPenalty);

      const speed =
        current.busProgress >= 0.95
          ? 0
          : Math.round(AVERAGE_BUS_SPEED_KMH + (Math.random() - 0.5) * 8);

      const distance = Math.max(
        0,
        Math.round(
          distanceAlongRoute(coordinates, current.busProgress) * 10
        ) / 10
      );

      updateDemo({ eta, speed, distance });
    }, 4000);

    return () => clearInterval(interval);
  }, [coordinates, updateDemo]);

  // Current / next stop from the city's route stops
  const stops = getStopsFromProgress(route.stops, progress);

  const status: BusTelemetry["status"] =
    demo.speed === 0
      ? "stopped"
      : demo.trafficLevel === "heavy"
        ? "delayed"
        : demo.eta <= 2
          ? "arriving"
          : "running";

  return {
    busNumber: bus.number,
    driverName: driver.name,
    routeName: route.name,
    speed: demo.speed,
    eta: demo.eta,
    distanceRemaining,
    passengerCount: demo.attendance,
    status,
    progress: Math.round(progress * 100),
    currentStop: stops.currentStop,
    nextStop: stops.nextStop,
    arrivalTime: formatArrivalTime(demo.eta),
    lastUpdated: new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
  };
}

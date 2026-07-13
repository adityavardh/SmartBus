"use client";

import { useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { useDemoStore, useNotificationStore, useSettingsStore } from "@/store";
import { speak } from "@/lib/utils";
import { playNotificationSound } from "@/lib/sounds";
import type { NotificationType } from "@/types";

const DEMO_EVENTS = [
  { at: 0.08, type: "bus_started" as const, title: "🟢 Bus Started", message: "SB-12 has started its morning route" },
  { at: 0.2, type: "traffic" as const, title: "🟡 Heavy Traffic Ahead", message: "Moderate congestion on Ring Road" },
  { at: 0.3, type: "student_boarded" as const, title: "🟢 Student Boarded", message: "3 students boarded at Green Park" },
  { at: 0.42, type: "route_change" as const, title: "🔵 Driver Changed Route", message: "Taking alternate route via Saket" },
  { at: 0.55, type: "delay" as const, title: "🟡 Delay Detected", message: "ETA increased by 2 minutes due to traffic" },
  { at: 0.68, type: "bus_arriving" as const, title: "🟢 Bus Arriving", message: "Your bus will arrive in 2 minutes" },
  { at: 0.82, type: "student_boarded" as const, title: "🟢 Student Boarded", message: "Adi Kumar boarded successfully" },
  { at: 0.95, type: "trip_complete" as const, title: "🟢 Trip Complete", message: "SB-12 arrived at Delhi Public School" },
];

const SOUND_MAP: Partial<Record<NotificationType, "success" | "warning" | "alert" | "info">> = {
  bus_started: "success",
  traffic: "warning",
  route_change: "info",
  student_boarded: "success",
  sos: "alert",
  bus_arriving: "success",
  delay: "warning",
  trip_complete: "success",
};

export function useDemoEngine() {
  const { demo, updateDemo } = useDemoStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceAnnouncements);
  const soundEnabled = useSettingsStore((s) => s.settings.soundEffects);
  const firedEvents = useRef(new Set<number>());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fireEvent = useCallback(
    (index: number) => {
      if (firedEvents.current.has(index)) return;
      firedEvents.current.add(index);
      const event = DEMO_EVENTS[index];
      if (!event) return;

      if (event.type !== "traffic") {
        addNotification({
          type: event.type,
          title: event.title,
          message: event.message,
        });
      }

      if (soundEnabled) {
        playNotificationSound(SOUND_MAP[event.type] ?? "info");
      }

      if (voiceEnabled) {
        speak(event.message, true);
      }

      if (event.type === "traffic") {
        updateDemo({ trafficLevel: "heavy", eta: demo.eta + 2 });
      }
      if (event.type === "student_boarded" && index === 2) {
        updateDemo({ attendance: demo.attendance + 3 });
      }
      if (event.type === "student_boarded" && index === 6) {
        updateDemo({ attendance: demo.attendance + 1 });
      }
      if (event.type === "trip_complete") {
        updateDemo({ tripCompleted: true, speed: 0, eta: 0, distance: 0 });
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#FFC247", "#2E8BFF", "#22C55E"],
        });
        if (soundEnabled) playNotificationSound("success");
      }
    },
    [addNotification, demo.eta, demo.attendance, updateDemo, voiceEnabled, soundEnabled]
  );

  // Rain mode during demo
  useEffect(() => {
    if (!demo.enabled) return;
    const rainTimer = setTimeout(() => {
      updateDemo({ isRaining: true, eta: useDemoStore.getState().demo.eta + 1 });
      addNotification({
        type: "delay",
        title: "🌧️ Rain Mode Active",
        message: "Wet roads — ETA adjusted by 1 minute",
      });
    }, 12000);
    return () => clearTimeout(rainTimer);
  }, [demo.enabled, updateDemo, addNotification]);

  // GPS lost / reconnect cycle
  useEffect(() => {
    if (!demo.enabled || demo.tripCompleted) return;

    gpsTimeoutRef.current = setTimeout(() => {
      updateDemo({ gpsConnected: false });
      addNotification({
        type: "delay",
        title: "📡 GPS Signal Lost",
        message: "Attempting to reconnect...",
      });

      setTimeout(() => {
        updateDemo({ gpsConnected: true });
        addNotification({
          type: "bus_started",
          title: "📡 GPS Reconnected",
          message: "Live tracking restored",
        });
        if (soundEnabled) playNotificationSound("success");
      }, 3500);
    }, 18000);

    return () => {
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
    };
  }, [demo.enabled, demo.tripCompleted, updateDemo, addNotification, soundEnabled]);

  useEffect(() => {
    if (!demo.enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      firedEvents.current.clear();
      return;
    }

    if (demo.tripCompleted) return;

    intervalRef.current = setInterval(() => {
      const { demo: current } = useDemoStore.getState();
      if (current.tripCompleted || !current.gpsConnected || current.simulatedOffline || current.schoolClosed) return;

      let progress = current.busProgress + 0.01;
      if (progress > 1) progress = 1;

      const baseEta = Math.max(0, Math.round((1 - progress) * 8));
      const trafficPenalty =
        current.trafficLevel === "heavy" ? 2 : current.trafficLevel === "medium" ? 1 : 0;
      const rainPenalty = current.isRaining ? 1 : 0;
      const eta = Math.max(0, baseEta + trafficPenalty + rainPenalty);
      const speed = progress >= 0.95 ? 0 : 25 + Math.random() * 20;
      const distance = Math.max(0, (1 - progress) * 3.5);

      updateDemo({
        busProgress: progress,
        eta,
        speed: Math.round(speed),
        distance: Math.round(distance * 10) / 10,
        attendance: current.attendance,
      });

      DEMO_EVENTS.forEach((event, index) => {
        if (progress >= event.at) {
          fireEvent(index);
        }
      });
    }, 1800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [demo.enabled, demo.tripCompleted, fireEvent, updateDemo]);

  useEffect(() => {
    if (!demo.enabled) {
      firedEvents.current.clear();
    }
  }, [demo.enabled]);
}

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  interpolateAlongLine,
  BUS_LOOP_DURATION_MS,
} from "@/lib/animation";
import { useRoute } from "@/hooks/useRoute";
import { useDemoStore } from "@/store";
import type { BusPosition } from "@/types/map";

interface UseBusAnimationOptions {
  enabled?: boolean;
  loop?: boolean;
}

export function useBusAnimation(options: UseBusAnimationOptions = {}) {
  const { enabled = true, loop = true } = options;
  const { coordinates } = useRoute();
  const updateDemo = useDemoStore((s) => s.updateDemo);
  const demoEnabled = useDemoStore((s) => s.demo.enabled);
  const tripCompleted = useDemoStore((s) => s.demo.tripCompleted);
  const gpsConnected = useDemoStore((s) => s.demo.gpsConnected);

  const [position, setPosition] = useState<BusPosition>(() => {
    const initial = interpolateAlongLine(coordinates, 0.45);
    return { ...initial, progress: 0.45 };
  });

  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const lastDemoSyncRef = useRef<number>(0);

  const shouldAnimate =
    enabled && coordinates.length > 1 && (!demoEnabled || (!tripCompleted && gpsConnected));

  const tick = useCallback(
    (now: number) => {
      if (!startRef.current) startRef.current = now;

      const elapsed = now - startRef.current;
      let progress: number;

      if (loop) {
        progress = (elapsed % BUS_LOOP_DURATION_MS) / BUS_LOOP_DURATION_MS;
      } else {
        progress = Math.min(elapsed / BUS_LOOP_DURATION_MS, 1);
      }

      const next = interpolateAlongLine(coordinates, progress);
      setPosition({ ...next, progress });

      if (now - lastDemoSyncRef.current > 500) {
        lastDemoSyncRef.current = now;
        updateDemo({ busProgress: progress });
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [coordinates, loop, updateDemo]
  );

  useEffect(() => {
    if (!shouldAnimate) return;

    startRef.current = performance.now() - position.progress * BUS_LOOP_DURATION_MS;
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAnimate, tick]);

  return position;
}

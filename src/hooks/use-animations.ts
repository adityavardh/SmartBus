"use client";

import { useEffect, useMemo, useState } from "react";
import { useSpring, useTransform } from "framer-motion";

export function useAnimatedCounter(target: number, duration = 1.5) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [value, setValue] = useState(0);

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useEffect(() => {
    return display.on("change", (v) => setValue(v));
  }, [display]);

  return value;
}

export function useMouseSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return position;
}

export function useLoader(onComplete?: () => void) {
  const [stage, setStage] = useState(0);
  const stages = useMemo(
    () => [
      "Finding nearest bus...",
      "Connecting to GPS...",
      "Fetching live location...",
      "Syncing route data...",
      "Almost ready...",
    ],
    []
  );

  useEffect(() => {
    const timers = stages.map((_, i) =>
      setTimeout(() => {
        setStage(i);
        if (i === stages.length - 1) {
          setTimeout(() => onComplete?.(), 800);
        }
      }, i * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete, stages]);

  return { stage, message: stages[stage] ?? stages[0], total: stages.length };
}

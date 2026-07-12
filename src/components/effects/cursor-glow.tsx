"use client";

import { useMouseSpotlight } from "@/hooks/use-animations";

export function CursorGlow() {
  const mouse = useMouseSpotlight();

  return (
    <div
      className="pointer-events-none fixed z-[5] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen transition-opacity duration-300"
      style={{
        left: mouse.x,
        top: mouse.y,
        background:
          "radial-gradient(circle, rgba(255,194,71,0.35) 0%, rgba(46,139,255,0.15) 40%, transparent 70%)",
        boxShadow: "0 0 40px rgba(255,194,71,0.2)",
      }}
    />
  );
}

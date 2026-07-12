"use client";

import { motion } from "framer-motion";
import { useMouseSpotlight } from "@/hooks/use-animations";

export function BackgroundEffects() {
  const mouse = useMouseSpotlight();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-background mesh-bg" />
      <div className="absolute inset-0 opacity-30 noise-bg mix-blend-screen" />

      <motion.div
        className="absolute w-[560px] h-[560px] rounded-full blur-[140px] opacity-25"
        style={{ background: "#2E8BFF", top: "-14%", left: "-8%" }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full blur-[110px] opacity-20"
        style={{ background: "#FFC247", bottom: "12%", right: "-4%" }}
        animate={{ x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[320px] h-[320px] rounded-full blur-[90px] opacity-15"
        style={{ background: "#22C55E", top: "42%", left: "48%" }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div
        className="absolute w-[620px] h-[620px] rounded-full opacity-[0.05] transition-all duration-300 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
          left: mouse.x - 300,
          top: mouse.y - 300,
        }}
      />

      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/80"
          style={{
            left: `${(i * 17 + 7) % 100}%`,
            top: `${(i * 23 + 11) % 100}%`,
          }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="absolute inset-0 opacity-[0.03] noise-bg" />
    </div>
  );
}

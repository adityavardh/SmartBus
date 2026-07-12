"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, ShieldCheck, Sparkles, Zap, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: "🕐", label: "Live ETA", desc: "Real-time bus arrival" },
  { icon: "📍", label: "GPS Tracking", desc: "Precise route updates" },
  { icon: "🔔", label: "Smart Alerts", desc: "Instant push notifications" },
  { icon: "🛡️", label: "SOS Emergency", desc: "One-tap safety button" },
];

const ROLE_PILLS = ["Student", "Parent", "Driver", "Admin"];

export function LandingAnimation() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => setPhase(4), 3600),
      setTimeout(() => setPhase(5), 4400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Cycle role pills
  useEffect(() => {
    const iv = setInterval(() => setActiveRole((p) => (p + 1) % ROLE_PILLS.length), 2200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,18,37,0.2),rgba(7,18,37,0.96))]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            left: `${(i * 13 + 5) % 100}%`,
            top: `${(i * 19 + 8) % 100}%`,
          }}
          animate={{ opacity: [0.08, 0.5, 0.08] }}
          transition={{ duration: 2.5 + (i % 4), repeat: Infinity, delay: i * 0.12 }}
        />
      ))}

      {/* Animated route line */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="route-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2E8BFF" stopOpacity="0" />
            <stop offset="30%" stopColor="#2E8BFF" />
            <stop offset="70%" stopColor="#FFC247" />
            <stop offset="100%" stopColor="#FFC247" stopOpacity="0" />
          </linearGradient>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main route path */}
        <motion.path
          d="M 0 720 C 200 600 350 560 480 580 S 780 500 960 440 S 1200 340 1440 270"
          fill="none"
          stroke="url(#route-blue)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow-soft)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: phase >= 1 ? 1 : 0, opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />

        {/* Dashed overlay */}
        <motion.path
          d="M 0 720 C 200 600 350 560 480 580 S 780 500 960 440 S 1200 340 1440 270"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeDasharray="12 20"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.15 }}
        />


        {/* Moving shimmer particle — uses native SVG animateMotion (no React prop warnings) */}
        {phase >= 1 && phase < 5 && (
          <circle r="5" fill="#FFC247" filter="url(#glow-soft)" opacity="0.9">
            <animateMotion
              dur="3.2s"
              begin="0.4s"
              fill="freeze"
              path="M 0 720 C 200 600 350 560 480 580 S 780 500 960 440 S 1200 340 1440 270"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur="3.2s"
              begin="0.4s"
              fill="freeze"
            />
          </circle>
        )}

      </svg>

      {/* Animated bus SVG following the path */}
      <AnimatePresence>
        {phase >= 1 && phase < 5 && (
          <motion.div
            className="absolute z-10"
            initial={{ left: "2%", top: "74%" }}
            animate={{ left: "86%", top: "28%" }}
            transition={{ duration: 3.2, ease: "easeInOut", delay: 0.4 }}
          >
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity }}>
              <svg width="68" height="40" viewBox="0 0 68 40">
                <rect x="6" y="6" width="56" height="28" rx="8" fill="#FFC247" />
                <rect x="12" y="10" width="12" height="9" rx="2" fill="#071225" opacity="0.3" />
                <rect x="28" y="10" width="12" height="9" rx="2" fill="#071225" opacity="0.3" />
                <rect x="44" y="10" width="12" height="9" rx="2" fill="#071225" opacity="0.3" />
                <circle cx="18" cy="34" r="5" fill="#111827" />
                <circle cx="50" cy="34" r="5" fill="#111827" />
                <rect x="58" y="12" width="4" height="7" rx="1.5" fill="#FFF2C2" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center content */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-10 text-center lg:px-8">

        {/* Logo icon */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-5 rounded-full bg-accent/25 blur-2xl"
                  animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-accent via-accent/80 to-accent/50 shadow-[0_0_40px_rgba(255,194,71,0.4)]">
                  <MapPin className="h-9 w-9 text-background" strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Role pills — cycling */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex gap-2 flex-wrap justify-center"
            >
              {ROLE_PILLS.map((role, idx) => (
                <motion.span
                  key={role}
                  animate={{
                    background:
                      activeRole === idx
                        ? "rgba(46,139,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                    borderColor:
                      activeRole === idx
                        ? "rgba(46,139,255,0.4)"
                        : "rgba(255,255,255,0.1)",
                    color:
                      activeRole === idx ? "#fff" : "rgba(255,255,255,0.4)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="px-4 py-1.5 rounded-full border text-xs font-medium"
                  style={{ willChange: "background,color" }}
                >
                  {role}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
            >
              <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-8xl lg:text-9xl">
                SMART<span className="text-accent">BUS</span>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-5 text-xl text-white/55 sm:text-2xl max-w-xl mx-auto"
              >
                Never wait for a bus blindly again.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Buttons */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button
                variant="accent"
                size="lg"
                onClick={() => router.push("/login")}
                className="h-14 px-10 text-base font-semibold shadow-[0_0_30px_rgba(255,194,71,0.3)] hover:shadow-[0_0_50px_rgba(255,194,71,0.45)] transition-shadow"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                onClick={() => router.push("/login")}
                className="h-14 px-10 text-base"
              >
                View Live Demo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature pills */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass-panel p-4 flex flex-col items-center gap-2 text-center hover:bg-white/8 transition-colors rounded-2xl cursor-default"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <p className="text-xs font-semibold text-white">{f.label}</p>
                  <p className="text-[10px] text-white/40 leading-tight">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust bar */}
        <AnimatePresence>
          {phase >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Secure & Encrypted
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-accent" />
                Real-time GPS
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-primary" />
                4 Roles · One Platform
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white/40" />
                Smart Notifications
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
    </div>
  );
}

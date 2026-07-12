"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bus, AlertTriangle, Route, UserCheck, Siren, Clock, CheckCircle } from "lucide-react";
import { useNotificationStore } from "@/store";
import type { NotificationType } from "@/types";

const ICONS: Record<NotificationType, { icon: React.ReactNode; color: string; bg: string }> = {
  bus_started:     { icon: <Bus className="w-4 h-4" />,       color: "text-success",  bg: "bg-success/15 border-success/30" },
  traffic:         { icon: <AlertTriangle className="w-4 h-4" />, color: "text-accent", bg: "bg-accent/15 border-accent/30" },
  route_change:    { icon: <Route className="w-4 h-4" />,     color: "text-primary",  bg: "bg-primary/15 border-primary/30" },
  student_boarded: { icon: <UserCheck className="w-4 h-4" />, color: "text-success",  bg: "bg-success/15 border-success/30" },
  sos:             { icon: <Siren className="w-4 h-4" />,     color: "text-danger",   bg: "bg-danger/15 border-danger/30" },
  bus_arriving:    { icon: <Clock className="w-4 h-4" />,     color: "text-success",  bg: "bg-success/15 border-success/30" },
  delay:           { icon: <AlertTriangle className="w-4 h-4" />, color: "text-accent", bg: "bg-accent/15 border-accent/30" },
  trip_complete:   { icon: <CheckCircle className="w-4 h-4" />, color: "text-success", bg: "bg-success/15 border-success/30" },
};

// Auto-dismiss after 2 seconds
function AutoDismissToast({ notification, onDismiss }: {
  notification: { id: string; type: NotificationType; title: string; message: string };
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = ICONS[notification.type];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [notification.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 120, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="pointer-events-auto"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border ${config.bg} backdrop-blur-xl p-4 shadow-float flex items-start gap-3 min-w-[280px] max-w-[340px]`}
      >
        {/* Progress bar — drains in 2 seconds */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-white/30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 2, ease: "linear" }}
        />

        <div className={`p-1.5 rounded-xl bg-white/10 ${config.color} shrink-0`}>
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-tight">{notification.title}</p>
          <p className="text-xs text-white/55 mt-0.5 leading-snug">{notification.message}</p>
        </div>

        <button
          onClick={() => onDismiss(notification.id)}
          className="text-white/30 hover:text-white/70 transition-colors shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export function ToastNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);

  // Only show unread toasts, max 3
  const toasts = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((notification) => (
          <AutoDismissToast
            key={notification.id}
            notification={notification}
            onDismiss={markRead}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

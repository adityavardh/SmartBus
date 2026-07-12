"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store";
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  MapPin,
  Bus,
} from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markRead, clearAll } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "sos":
      case "delay":
        return <AlertTriangle className="w-5 h-5 text-danger" />;
      case "bus_started":
      case "trip_complete":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "bus_arriving":
      case "student_boarded":
        return <MapPin className="w-5 h-5 text-accent" />;
      default:
        return <Bus className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-white/50">Your alerts and system updates</p>
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" onClick={clearAll} className="text-danger hover:bg-danger/10 hover:text-danger">
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          )}
        </motion.div>

        {notifications.length === 0 ? (
          <Card className="bg-transparent border-dashed border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-lg font-medium text-white/50">No notifications</p>
              <p className="text-sm text-white/30">You&apos;re all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`overflow-hidden transition-colors ${notif.read ? 'bg-white/[0.02] border-white/5' : 'bg-white/5 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.03)]'}`}>
                  <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                    <div className={`p-2 rounded-xl bg-white/5 ${!notif.read ? 'animate-pulse' : ''}`}>
                      {getIcon(notif.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className={`font-semibold truncate ${notif.read ? 'text-white/70' : 'text-white'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-xs text-white/40 whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm ${notif.read ? 'text-white/40' : 'text-white/70'}`}>
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/20 hover:text-primary shrink-0"
                        onClick={() => markRead(notif.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Mark Read</span>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <MobileNav />
    </AppLayout>
  );
}

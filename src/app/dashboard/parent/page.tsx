"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocationStore, selectChild, selectDriver } from "@/store/locationStore";
import { Phone, MapPin, Bus, Bell, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { LiveMap } from "@/components/map/live-map";

export default function ParentDashboard() {
  const child = useLocationStore(selectChild);
  const driver = useLocationStore(selectDriver);
  const [calling, setCalling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleCallDriver = () => {
    if (calling) return;
    setCalling(true);
    setToast(`📞 Dialing ${driver.name}…`);
    setTimeout(() => {
      setCalling(false);
      setToast(null);
    }, 4000);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Tracking {child.name}</h1>
          <p className="text-white/50">{child.class} • {child.busNumber}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glow float>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                  <Avatar className="w-20 h-20 ring-4 ring-[#8b5cf6]/30">
                    <AvatarImage src={child.photo} />
                    <AvatarFallback>{child.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-white">{child.name}</h2>
                    <p className="text-white/50 mb-4">{child.class} • Seat {child.seatNumber}</p>

                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                      {child.boarded ? (
                        <div className="px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Boarded at {child.boardedAt}
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-sm">
                          Waiting for bus
                        </div>
                      )}

                      <div className="px-3 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Dest: School
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 overflow-hidden relative">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-card/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
                  <div className="flex items-center gap-2">
                    <Bus className="w-4 h-4 text-[#8b5cf6]" />
                    <span className="font-semibold text-white">Live Location</span>
                  </div>
                  <Link href="/map/student">
                    <Button variant="glass" size="sm" className="h-8">Full Map</Button>
                  </Link>
                </div>
                <div className="h-[300px]">
                  <LiveMap />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Assigned Driver</h3>
                <div className="flex items-center gap-4 p-4 rounded-[22px] bg-white/5 border border-white/10">
                  <Avatar className="w-12 h-12 ring-2 ring-[#8b5cf6]/30">
                    <AvatarImage src={driver.photo} />
                    <AvatarFallback>{driver.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{driver.name}</p>
                    <p className="text-xs text-white/50">{child.busNumber} • {driver.rating}★</p>
                    <p className="text-xs text-white/40">{driver.experience} experience</p>
                  </div>
                  <Button
                    variant="glass"
                    size="icon"
                    className={`rounded-full shrink-0 transition-colors ${
                      calling
                        ? "bg-success/20 border-success/40 text-success"
                        : "hover:bg-success/20 hover:text-success hover:border-success/40"
                    }`}
                    onClick={handleCallDriver}
                    disabled={calling}
                    title={`Call ${driver.name}`}
                  >
                    <Phone className={`w-4 h-4 ${calling ? "animate-pulse" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#8b5cf6]" />
                  Recent Updates
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Today</h4>
                    <div className="space-y-4">
                      {child.boarded && child.boardedAt && (
                        <NotificationItem
                          time={child.boardedAt}
                          text={`${child.name} boarded the bus at ${child.boardedStop}`}
                        />
                      )}
                      <NotificationItem time="—" text="Bus departed from depot" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Earlier</h4>
                    <div className="space-y-4">
                      <NotificationItem time="Yesterday" text={`${child.name} reached home safely`} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNav />

      {/* Call toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl border border-success/30 bg-success/20 backdrop-blur-xl shadow-float text-sm font-semibold text-success whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function NotificationItem({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.5)] shrink-0" />
      <div>
        <p className="text-sm text-white">{text}</p>
        <p className="text-xs text-white/40 mt-1">{time}</p>
      </div>
    </div>
  );
}

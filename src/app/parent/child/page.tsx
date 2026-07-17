"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bus,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  Clock,
  School,
  Navigation,
  User,
} from "lucide-react";
import { useLocationStore, selectChild, selectDriver } from "@/store/locationStore";
import Link from "next/link";

export default function MyChildPage() {
  const child = useLocationStore(selectChild);
  const driver = useLocationStore(selectDriver);
  const [calling, setCalling] = useState(false);

  const handleCall = () => {
    setCalling(true);
    setTimeout(() => setCalling(false), 4000);
  };

  // Journey steps derived from child boarding state
  const journeySteps = [
    {
      id: "boarded",
      label: "Boarded",
      detail: child.boardedAt
        ? `${child.boardedStop ?? "Stop"} at ${child.boardedAt}`
        : "Not yet boarded",
      done: child.boarded,
    },
    {
      id: "transit",
      label: "In Transit",
      detail: child.boarded && !child.reachedSchool ? `Near ${child.currentStop ?? "en route"}` : "—",
      done: child.boarded && !child.reachedSchool,
      active: child.boarded && !child.reachedSchool,
    },
    {
      id: "school",
      label: "Reached School",
      detail: child.reachedSchool ? "Arrived safely" : "En route",
      done: child.reachedSchool,
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">My Child</h1>
          <p className="text-white/50">Live status &amp; journey details</p>
        </motion.div>

        {/* Child profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glow float className="overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 sm:p-7 relative">
              <div className="flex items-center gap-5 mb-6">
                <Avatar className="w-20 h-20 ring-4 ring-[#8b5cf6]/30">
                  <AvatarImage src={child.photo} />
                  <AvatarFallback className="text-2xl">{child.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{child.name}</h2>
                  <p className="text-sm text-white/50 mt-0.5">{child.class}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/60 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Seat {child.seatNumber}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/60 flex items-center gap-1.5">
                      <Bus className="w-3 h-3" /> Bus {child.busNumber}
                    </span>
                  </div>
                </div>
                {/* Boarding status chip */}
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 shrink-0 ${
                    child.reachedSchool
                      ? "bg-success/10 border-success/20 text-success"
                      : child.boarded
                      ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6]"
                      : "bg-accent/10 border-accent/20 text-accent"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      child.reachedSchool
                        ? "bg-success"
                        : child.boarded
                        ? "bg-[#8b5cf6] animate-pulse"
                        : "bg-accent"
                    }`}
                  />
                  {child.reachedSchool
                    ? "At School"
                    : child.boarded
                    ? "On Bus"
                    : "Waiting"}
                </div>
              </div>

              {/* Current stop */}
              {child.currentStop && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/8 mb-4">
                  <div className="p-2 rounded-xl bg-[#8b5cf6]/15">
                    <MapPin className="w-4 h-4 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Current Location</p>
                    <p className="text-sm font-medium text-white">{child.currentStop}</p>
                  </div>
                  <Link href="/map/student" className="ml-auto">
                    <Button variant="glass" size="sm">
                      <Navigation className="w-3.5 h-3.5 mr-1" /> Track
                    </Button>
                  </Link>
                </div>
              )}

              {/* Journey timeline */}
              <div className="space-y-1">
                {journeySteps.map((step, i) => (
                  <div key={step.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          step.done
                            ? "bg-success"
                            : step.active
                            ? "bg-[#8b5cf6] animate-pulse"
                            : "bg-white/20"
                        }`}
                      />
                      {i < journeySteps.length - 1 && (
                        <div
                          className={`w-px flex-1 min-h-[28px] mt-1 ${
                            step.done ? "bg-success/30" : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <p
                        className={`text-sm font-medium ${
                          step.active ? "text-[#8b5cf6]" : step.done ? "text-white" : "text-white/30"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-white/40">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Driver card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Assigned Driver
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-accent/30">
                  <AvatarImage src={driver.photo} />
                  <AvatarFallback>{driver.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-white">{driver.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span className="text-xs text-white/50">{driver.rating} • {driver.experience}</span>
                  </div>
                </div>
                <Button
                  variant="accent"
                  className="shrink-0"
                  onClick={handleCall}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {calling ? "Dialing..." : "Call"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Yesterday summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Yesterday&apos;s Summary
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/8 text-center">
                  <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-2" />
                  <p className="text-xs text-white/50">Morning</p>
                  <p className="text-sm font-semibold text-success">On Time</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/8 text-center">
                  <Clock className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-xs text-white/50">Total</p>
                  <p className="text-sm font-semibold text-white">42 min</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/8 text-center">
                  <School className="w-5 h-5 text-[#8b5cf6] mx-auto mb-2" />
                  <p className="text-xs text-white/50">Arrival</p>
                  <p className="text-sm font-semibold text-white">08:54 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

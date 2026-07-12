"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { MAIN_ROUTE } from "@/data/mock";
import { Navigation, Clock, CheckCircle2 } from "lucide-react";

export default function StudentRoutePage() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">My Route Details</h1>
          <p className="text-white/50">{MAIN_ROUTE.name}</p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-white font-medium">{MAIN_ROUTE.school}</p>
                <p className="text-xs text-white/50">Final Destination</p>
              </div>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:inset-y-4 before:left-[15px] before:w-0.5 before:bg-white/10">
              {MAIN_ROUTE.stops.map((stop) => (
                <div key={stop.id} className="relative">
                  <div className={`absolute -left-10 w-4 h-4 rounded-full border-[3px] flex items-center justify-center bg-card ${
                    stop.status === 'completed' ? 'border-success' : 
                    stop.status === 'current' ? 'border-accent shadow-[0_0_12px_rgba(255,194,71,0.5)]' : 
                    'border-white/30'
                  }`}>
                    {stop.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-success absolute" />}
                  </div>
                  
                  <div className={`p-5 rounded-2xl border transition-all ${
                    stop.status === 'current' ? 'bg-accent/5 border-accent/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`text-lg font-semibold ${stop.status === 'current' ? 'text-accent' : 'text-white'}`}>
                          {stop.name}
                        </h3>
                        {stop.name === "Saket District Centre" && (
                          <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] uppercase tracking-wider font-bold bg-primary/20 text-primary">
                            Your Stop
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-white/40" />
                          {stop.time}
                        </span>
                        <span className="text-xs text-white/40 mt-1">Scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

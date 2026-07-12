"use client";


import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { DashboardHero, ETACountdown, TripTimeline } from "@/components/dashboard/dashboard-cards";
import { Card, CardContent } from "@/components/ui/card";

import { WEATHER } from "@/data/mock";

export default function StudentDashboard() {
  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <DashboardHero />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TripTimeline />
          </div>
          
          <div className="space-y-6">
            <ETACountdown />
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                  Commute Weather
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-primary/20 flex items-center justify-center text-2xl">
                    {WEATHER.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{WEATHER.temp}°C</p>
                    <p className="text-sm text-white/60">{WEATHER.condition} • No delays expected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/store";
import { speak } from "@/lib/utils";
import { useSettingsStore } from "@/store";
import {
  Siren,
  Phone,
  Shield,
  Ambulance,
  Users,
  Building,
  Share2,
  AlertTriangle,
} from "lucide-react";

const EMERGENCY_CONTACTS = [
  { name: "Police", phone: "100", icon: Shield, color: "text-primary" },
  { name: "Ambulance", phone: "108", icon: Ambulance, color: "text-danger" },
  { name: "Guardian", phone: "+91 98765 43210", icon: Users, color: "text-success" },
  { name: "Transport Office", phone: "+91 1800 123 456", icon: Building, color: "text-accent" },
];

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceAnnouncements);

  const triggerSOS = (type: string) => {
    setSosActive(true);
    addNotification({
      type: "sos",
      title: "SOS Triggered",
      message: `${type} emergency alert sent to all contacts`,
    });
    speak("Emergency alert triggered. Help is on the way.", voiceEnabled);

    setTimeout(() => setSosActive(false), 5000);
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Emergency Center</h1>
          <p className="text-white/50">Quick access to emergency services</p>
        </motion.div>

        {/* SOS Button */}
        <div className="flex justify-center py-8">
          <motion.button
            onClick={() => triggerSOS("General")}
            className={`relative w-40 h-40 rounded-full flex items-center justify-center ${
              sosActive ? "bg-danger" : "bg-danger/80 hover:bg-danger"
            } shadow-[0_0_60px_rgba(239,68,68,0.4)] transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={sosActive ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: sosActive ? Infinity : 0 }}
          >
            {sosActive && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-danger"
                animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div className="text-center">
              <Siren className="w-10 h-10 text-white mx-auto mb-1" />
              <span className="text-white font-bold text-lg">SOS</span>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="danger"
            size="lg"
            onClick={() => triggerSOS("Driver")}
            className="h-auto py-6 flex-col gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Driver Emergency
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => triggerSOS("Student")}
            className="h-auto py-6 flex-col gap-2"
          >
            <AlertTriangle className="w-6 h-6" />
            Student Emergency
          </Button>
        </div>

        <Button variant="glass" className="w-full">
          <Share2 className="w-4 h-4" />
          Share Live GPS Location
        </Button>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <motion.a
                  key={contact.name}
                  href={`tel:${contact.phone}`}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${contact.color}`}>
                    <contact.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-white/40">{contact.phone}</p>
                  </div>
                  <Phone className="w-4 h-4 text-white/30 ml-auto" />
                </motion.a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

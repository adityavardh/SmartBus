"use client";

import { motion } from "framer-motion";
import { AppLayout, MobileNav } from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/store";
import {
  Moon,
  Bell,
  Volume2,
  Mic,
  Globe,
  Eye,
  Contrast,
  Fingerprint,
  Info,
  HelpCircle,
  Star,
} from "lucide-react";

const SETTINGS_GROUPS = [
  {
    title: "Appearance",
    items: [
      { key: "theme" as const, icon: Moon, label: "Dark Mode", description: "Always use dark theme", type: "switch" as const, value: true },
      { key: "largeText" as const, icon: Eye, label: "Large Text", description: "Increase text size", type: "switch" as const },
      { key: "highContrast" as const, icon: Contrast, label: "High Contrast", description: "Enhanced visibility", type: "switch" as const },
    ],
  },
  {
    title: "Notifications",
    items: [
      { key: "notifications" as const, icon: Bell, label: "Push Notifications", description: "Bus updates & alerts", type: "switch" as const },
      { key: "soundEffects" as const, icon: Volume2, label: "Sound Effects", description: "Notification sounds", type: "switch" as const },
      { key: "voiceAnnouncements" as const, icon: Mic, label: "Voice Announcements", description: "Spoken bus updates", type: "switch" as const },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { key: "biometricLogin" as const, icon: Fingerprint, label: "Biometric Login", description: "Face ID / Fingerprint", type: "switch" as const },
    ],
  },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/50">Customize your experience</p>
        </motion.div>

        {SETTINGS_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
                {group.title}
              </h3>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Label className="text-white">{item.label}</Label>
                        <p className="text-xs text-white/40">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={item.key === "theme" ? settings.theme === "dark" : settings[item.key] as boolean}
                      onCheckedChange={(checked) => {
                        if (item.key === "theme") {
                          updateSettings({ theme: checked ? "dark" : "light" });
                        } else {
                          updateSettings({ [item.key]: checked });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">General</h3>
            <div className="space-y-3">
              <SettingLink icon={Globe} label="Language" value={settings.language} />
              <SettingLink icon={Info} label="About SmartBus" value="v1.0.0" />
              <SettingLink icon={HelpCircle} label="Support" value="" />
              <SettingLink icon={Star} label="Rate App" value="" />
            </div>
          </CardContent>
        </Card>
      </div>
      <MobileNav />
    </AppLayout>
  );
}

function SettingLink({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-white/40" />
        <span className="text-sm text-white">{label}</span>
      </div>
      {value && <span className="text-xs text-white/40">{value}</span>}
    </button>
  );
}

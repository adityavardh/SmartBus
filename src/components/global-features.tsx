"use client";

import { useDemoEngine } from "@/hooks/use-demo-engine";
import { BackgroundEffects } from "@/components/effects/background-effects";
import { CursorGlow } from "@/components/effects/cursor-glow";
import { ToastNotifications } from "@/components/notifications/toast-notifications";
import { DemoModeToggle } from "@/components/demo/demo-mode-toggle";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { SearchModal } from "@/components/search/search-modal";
import { StatusBanners } from "@/components/effects/status-banners";
import { AccessibilityProvider } from "@/components/accessibility-provider";

export function GlobalFeatures() {
  useDemoEngine();

  return (
    <>
      <AccessibilityProvider />
      <BackgroundEffects />
      <CursorGlow />
      <StatusBanners />
      <ToastNotifications />
      <DemoModeToggle />
      <AIAssistant />
      <SearchModal />
    </>
  );
}

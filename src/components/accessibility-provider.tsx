"use client";

import { useEffect } from "react";
import { useAppStore, useSettingsStore } from "@/store";

export function AccessibilityProvider() {
  const { settings } = useSettingsStore();
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("large-text", settings.largeText);
    root.classList.toggle("high-contrast", settings.highContrast);
  }, [settings.largeText, settings.highContrast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  return null;
}

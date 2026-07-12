import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} KM`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function formatETA(minutes: number): string {
  if (minutes <= 0) return "Arriving now";
  if (minutes === 1) return "1 Minute";
  return `${minutes} Minutes`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function interpolatePosition(
  route: { lat: number; lng: number }[],
  progress: number
): { lat: number; lng: number } {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (progress <= 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  const totalSegments = route.length - 1;
  const scaledProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
  const segmentProgress = scaledProgress - segmentIndex;

  const start = route[segmentIndex];
  const end = route[segmentIndex + 1];

  return {
    lat: lerp(start.lat, end.lat, segmentProgress),
    lng: lerp(start.lng, end.lng, segmentProgress),
  };
}

export function speak(text: string, enabled: boolean) {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

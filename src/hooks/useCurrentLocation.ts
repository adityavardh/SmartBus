/**
 * useCurrentLocation
 *
 * Triggers the one-time location detection pipeline and returns
 * the current state from the location store.
 *
 * Call this once near the app root (e.g. in a provider or layout).
 * Subsequent calls are no-ops thanks to the isReady guard.
 */

"use client";

import { useEffect } from "react";
import {
  useLocationStore,
  selectUserLocation,
} from "@/store/locationStore";

export function useCurrentLocation() {
  const initLocation = useLocationStore((s) => s.initLocation);
  const isReady = useLocationStore((s) => s.isReady);
  const isLoading = useLocationStore((s) => s.isLoading);
  const error = useLocationStore((s) => s.error);
  const cityId = useLocationStore((s) => s.cityId);
  const cityLabel = useLocationStore((s) => s.cityLabel);
  const locationPermission = useLocationStore((s) => s.locationPermission);
  const userLocation = useLocationStore(selectUserLocation);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  return {
    isReady,
    isLoading,
    error,
    cityId,
    cityLabel,
    locationPermission,
    userLocation,
  };
}

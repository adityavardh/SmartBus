/**
 * useBusTracking
 *
 * Aggregates bus + driver + route telemetry into one object.
 * Used by components that need a full picture of the current trip.
 *
 * FUTURE BACKEND: Replace with a real-time WebSocket or polling hook.
 */

"use client";

import {
  useLocationStore,
  selectBus,
  selectDriver,
  selectRoute,
  selectSchool,
} from "@/store/locationStore";
import { useBusSimulation } from "@/hooks/useBusSimulation";

export function useBusTracking() {
  const bus = useLocationStore(selectBus);
  const driver = useLocationStore(selectDriver);
  const route = useLocationStore(selectRoute);
  const school = useLocationStore(selectSchool);
  const telemetry = useBusSimulation();

  return {
    bus,
    driver,
    route,
    school,
    telemetry,
  };
}

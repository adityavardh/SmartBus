/**
 * useDriver
 *
 * Returns the driver assigned for the current session.
 *
 * FUTURE BACKEND: Replace locationStore.driver with
 * const { data } = useSWR("/api/drivers/assigned")
 */

"use client";

import { useLocationStore, selectDriver } from "@/store/locationStore";

export function useDriver() {
  const driver = useLocationStore(selectDriver);
  return driver;
}

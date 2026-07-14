/**
 * useSchool
 *
 * Returns the school assigned to the current city's primary route.
 *
 * FUTURE BACKEND: When locationStore is replaced with API calls,
 * this hook's interface stays the same.
 */

"use client";

import { useLocationStore, selectSchool } from "@/store/locationStore";

export function useSchool() {
  const school = useLocationStore(selectSchool);
  return school;
}

/**
 * useParent
 *
 * Returns the parent profile and live user location for the parent marker.
 * The parent marker always sits at the browser's detected coordinates.
 *
 * FUTURE BACKEND: Replace with /api/parents/me
 */

"use client";

import {
  useLocationStore,
  selectParent,
  selectUserLocation,
  selectChild,
} from "@/store/locationStore";

export function useParent() {
  const parent = useLocationStore(selectParent);
  const child = useLocationStore(selectChild);
  const userLocation = useLocationStore(selectUserLocation);

  return {
    parent,
    child,
    /** Parent's live position = browser location */
    position: userLocation,
  };
}

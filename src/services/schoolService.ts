/**
 * schoolService.ts
 *
 * Returns the school assigned to a given city route.
 *
 * FUTURE BACKEND: Replace with GET /api/schools/:id
 */

import { SCHOOL_DATABASE } from "@/data/schools";
import type { SchoolData, CityRouteData } from "@/types/location";

export function getSchoolForRoute(route: CityRouteData): SchoolData {
  const school = SCHOOL_DATABASE[route.schoolId];
  if (!school) {
    throw new Error(
      `School "${route.schoolId}" not found in SCHOOL_DATABASE. ` +
        `Add it to src/data/schools.ts.`
    );
  }
  return school;
}

export function getSchoolById(schoolId: string): SchoolData | undefined {
  return SCHOOL_DATABASE[schoolId];
}

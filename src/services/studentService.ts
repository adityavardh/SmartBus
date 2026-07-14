/**
 * studentService.ts
 *
 * Returns the current student and child profiles for a given city.
 *
 * FUTURE BACKEND: Replace with GET /api/students/me and GET /api/children/me
 */

import {
  STUDENT_DATABASE,
  CHILD_DATABASE,
} from "@/data/students";
import type { StudentProfile, ChildProfile } from "@/types/location";

function sessionSeed(): number {
  const now = new Date();
  return (
    now.getFullYear() * 1000 +
    Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
        86_400_000
    )
  );
}

const FALLBACK_STUDENT: StudentProfile = {
  id: "stu-fallback",
  name: "Student",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Student&backgroundColor=2E8BFF",
  class: "Class 9-A",
  seatNumber: "S-01",
  guardian: "Parent",
  stopName: "Stop 1",
  cityId: "hyderabad",
};

const FALLBACK_CHILD: ChildProfile = {
  id: "chd-fallback",
  name: "Student",
  photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Student&backgroundColor=7C3AED",
  class: "Class 9-A",
  seatNumber: "S-01",
  busId: "b-hyd-1",
  busNumber: "TS-09",
  routeId: "hyd-r1",
  driverId: "drv-hyd-1",
  driverName: "Ravi Kumar Reddy",
  driverPhone: "+91 98490 11234",
  boarded: false,
  reachedSchool: false,
  reachedHome: false,
  cityId: "hyderabad",
};

export function getStudentForCity(cityId: string): StudentProfile {
  const pool = STUDENT_DATABASE[cityId];
  if (!pool || pool.length === 0) return FALLBACK_STUDENT;
  return pool[sessionSeed() % pool.length];
}

export function getChildForCity(cityId: string): ChildProfile {
  const pool = CHILD_DATABASE[cityId];
  if (!pool || pool.length === 0) return FALLBACK_CHILD;
  return pool[sessionSeed() % pool.length];
}

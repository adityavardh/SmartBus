import { UserRole } from "@/types";

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  student: [
    "/dashboard/student",
    "/map/student",
    "/route/student",
    "/notifications",
    "/profile",
    "/emergency",
    "/settings",
    "/bus/student"
  ],
  parent: [
    "/dashboard/parent",
    "/map/student", // parent uses same map component but filtered
    "/notifications",
    "/profile",
    "/emergency",
    "/settings",
    "/bus/student"
  ],
  driver: [
    "/dashboard/driver",
    "/route/driver",
    "/attendance/driver",
    "/notifications",
    "/profile",
    "/emergency",
    "/settings"
  ],
  admin: [
    "/dashboard/admin",
    "/fleet/admin",
    "/map/admin",
    "/reports/admin",
    "/notifications",
    "/profile",
    "/emergency",
    "/settings"
  ],
};

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  driver: "/dashboard/driver",
  admin: "/dashboard/admin",
};

export function getRoleDashboard(role: UserRole): string {
  return ROLE_DASHBOARDS[role] || "/login";
}

export function isRouteAllowed(role: UserRole | undefined, pathname: string): boolean {
  if (!role) return false;
  
  // Allow these paths for all authenticated users
  if (["/", "/login", "/unauthorized"].includes(pathname)) {
    return true;
  }

  const allowedRoutes = ROLE_ROUTES[role] || [];
  
  // Check exact match or if pathname starts with allowed route + "/"
  return allowedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

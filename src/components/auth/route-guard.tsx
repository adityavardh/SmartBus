"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { isRouteAllowed, getRoleDashboard } from "@/lib/auth";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
      return;
    }

    // If authenticated and on login page, redirect to their role dashboard
    if (isAuthenticated && pathname === "/login") {
      router.push(getRoleDashboard(role));
      return;
    }

    // If authenticated, check if they can access this route
    if (isAuthenticated && !isRouteAllowed(role, pathname)) {
      router.push("/unauthorized");
      return;
    }

    setIsAuthorized(true);
  }, [isAuthenticated, pathname, role, router]);

  // Don't render children until we've checked authorization
  // Exception for login page when not authenticated
  if (!isAuthorized && pathname !== "/login") {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}

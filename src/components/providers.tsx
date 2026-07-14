"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

/**
 * LocationBootstrap — calls initLocation() once when the app mounts.
 * Sits inside Providers so it runs on every page after hydration.
 */
function LocationBootstrap() {
  const initLocation = useLocationStore((s) => s.initLocation);

  useEffect(() => {
    initLocation();
  }, [initLocation]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LocationBootstrap />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

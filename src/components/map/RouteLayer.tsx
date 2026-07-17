"use client";

/**
 * RouteLayer.tsx
 *
 * Renders the road-snapped bus route with a traveled / remaining visual split.
 *
 * ── Layers (bottom → top) ─────────────────────────────────────────────────────
 *   route-glow          wide, low-opacity glow under the whole path
 *   route-traveled      dim white/gray  — portion the bus has already covered
 *   route-remaining     bright blue     — portion still ahead
 *   route-traffic       amber dash      — traffic overlay (optional)
 *   route-loading       dashed blue     — provisional while OSRM is loading
 *
 * ── Traveled / remaining split ────────────────────────────────────────────────
 *   busProgress (0–1) comes from the DemoStore and is written by useBusAnimation
 *   every 500 ms.  We walk the cumulative segment lengths to find the index of
 *   the coordinate point that sits just past the bus, then slice:
 *     traveled  = coords[0 … splitIndex]
 *     remaining = coords[splitIndex … end]
 *   Both slices share the split point so there is never a visible gap.
 *
 * ── Unchanged ─────────────────────────────────────────────────────────────────
 *   • All MapRoute ids, colors, and widths for the main line are identical to
 *     the previous version — no visual regression for the non-split parts.
 *   • The `coordinates` prop is still accepted (BusMap contract unchanged).
 */

import { useMemo } from "react";
import { MapRoute } from "@/components/ui/map";
import { useRoadRoute } from "@/hooks/useRoadRoute";
import { useDemoStore } from "@/store";
import { computeSegmentLengths } from "@/lib/animation";
import type { Coordinate } from "@/types/map";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUTE_COLOR     = "#2E8BFF";   // bright blue  — remaining
const TRAVELED_COLOR  = "#4A5568";   // muted slate  — traveled
const GLOW_COLOR      = ROUTE_COLOR;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Split a coordinate array into [traveled, remaining] at the point that
 * corresponds to `progress` (0–1) along the total route length.
 * Both sub-arrays share the split coordinate so the join is seamless.
 */
function splitAtProgress(
  coords: Coordinate[],
  progress: number
): { traveled: Coordinate[]; remaining: Coordinate[] } {
  if (coords.length < 2 || progress <= 0) {
    return { traveled: [], remaining: coords };
  }
  if (progress >= 1) {
    return { traveled: coords, remaining: [] };
  }

  const cumulative = computeSegmentLengths(coords);
  const total      = cumulative[cumulative.length - 1] || 1;
  const target     = Math.max(0, Math.min(1, progress)) * total;

  // Find the first index whose cumulative distance exceeds the target
  let splitIdx = coords.length - 1;
  for (let i = 0; i < cumulative.length - 1; i++) {
    if (cumulative[i + 1] >= target) {
      splitIdx = i + 1;
      break;
    }
  }

  // traveled includes the split point; remaining starts from it
  const traveled  = coords.slice(0, splitIdx + 1);
  const remaining = coords.slice(splitIdx);

  return { traveled, remaining };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RouteLayerProps {
  /** Straight-line fallback coordinates from the store (BusMap contract). */
  coordinates: Coordinate[];
  showTraffic?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RouteLayer({ coordinates: _fallback, showTraffic }: RouteLayerProps) {
  void _fallback; // contract prop — BusMap passes straight-line fallback here
  const { coordinates, isSnapped, isLoading } = useRoadRoute();

  // busProgress: written by useBusAnimation every 500 ms via updateDemo
  const busProgress = useDemoStore((s) => s.demo.busProgress);

  // Recompute the split whenever the route or bus progress changes.
  // computeSegmentLengths is O(n) but coords rarely exceed ~300 points and
  // busProgress updates at most every 500 ms, so this is negligible.
  const { traveled, remaining } = useMemo(
    () => splitAtProgress(coordinates, busProgress),
    [coordinates, busProgress]
  );

  if (coordinates.length < 2) return null;

  const isProvisional = isLoading && !isSnapped;
  const glowOpacity   = isProvisional ? 0.08 : 0.18;

  return (
    <>
      {/* ── Glow — full route, always visible ───────────────────────────── */}
      <MapRoute
        id="route-glow"
        coordinates={coordinates}
        color={GLOW_COLOR}
        width={14}
        opacity={glowOpacity}
        interactive={false}
      />

      {/* ── Traveled portion — dim, behind the bus ──────────────────────── */}
      {traveled.length >= 2 && (
        <MapRoute
          id="route-traveled"
          coordinates={traveled}
          color={TRAVELED_COLOR}
          width={5}
          opacity={0.55}
          interactive={false}
        />
      )}

      {/* ── Remaining portion — bright, ahead of the bus ────────────────── */}
      {remaining.length >= 2 && (
        <MapRoute
          id="route-remaining"
          coordinates={remaining}
          color={ROUTE_COLOR}
          width={5}
          opacity={isProvisional ? 0.45 : 0.92}
          interactive={false}
        />
      )}

      {/* ── Fallback: single full line when split arrays are too short ───── */}
      {(traveled.length < 2 && remaining.length < 2) && (
        <MapRoute
          id="route-main"
          coordinates={coordinates}
          color={ROUTE_COLOR}
          width={5}
          opacity={isProvisional ? 0.45 : 0.92}
          interactive={false}
        />
      )}

      {/* ── Traffic overlay ─────────────────────────────────────────────── */}
      {showTraffic && (
        <MapRoute
          id="route-traffic"
          coordinates={coordinates}
          color="#FFC247"
          width={8}
          opacity={0.15}
          dashArray={[2, 4]}
          interactive={false}
        />
      )}

      {/* ── Dashed provisional line while OSRM is loading ───────────────── */}
      {isProvisional && (
        <MapRoute
          id="route-loading"
          coordinates={coordinates}
          color={ROUTE_COLOR}
          width={5}
          opacity={0.35}
          dashArray={[4, 6]}
          interactive={false}
        />
      )}
    </>
  );
}

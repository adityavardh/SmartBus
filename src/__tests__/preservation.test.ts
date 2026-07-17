/**
 * Preservation Tests
 * ===================
 * These tests confirm that unchanged behaviors remain intact after the
 * NextAuth v5 refactor + bug fixes.  Each test group corresponds to one
 * of the 10 "must not change" behaviors from the spec.
 *
 * All checks use fs.readFileSync (static analysis) — no DOM render needed.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");

/** Read a source file relative to src/ */
function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, "src", relPath), "utf-8");
}

/** Check whether a file exists relative to project root */
function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ---------------------------------------------------------------------------
// P1 — Authentication flow is preserved
// ---------------------------------------------------------------------------
describe("P1 – Authentication flow is preserved", () => {
  it("src/auth.ts exports handlers, signIn, signOut, auth", () => {
    const content = readSrc("auth.ts");
    // The destructured export line must include all four names
    expect(content).toMatch(/\bhandlers\b/);
    expect(content).toMatch(/\bsignIn\b/);
    expect(content).toMatch(/\bsignOut\b/);
    expect(content).toMatch(/\bauth\b/);
    // They should be in a single export destructuring from NextAuth(...)
    expect(content).toMatch(/export\s+const\s+\{\s*handlers/);
  });

  it("src/auth.config.ts has the authorized callback", () => {
    const content = readSrc("auth.config.ts");
    expect(content).toMatch(/\bauthorized\b/);
    // Verify it's inside the callbacks block
    expect(content).toMatch(/callbacks\s*:/);
    expect(content).toMatch(/authorized\s*\(/);
  });

  it("src/middleware.ts imports from next-auth", () => {
    const content = readSrc("middleware.ts");
    expect(content).toMatch(/from\s+['"]next-auth['"]/);
  });

  it("src/middleware.ts imports from @/auth.config", () => {
    const content = readSrc("middleware.ts");
    expect(content).toMatch(/from\s+['"]@\/auth\.config['"]/);
  });
});

// ---------------------------------------------------------------------------
// P2 — RouteGuard still redirects unauthenticated users
// ---------------------------------------------------------------------------
describe("P2 – RouteGuard still redirects unauthenticated users", () => {
  it("route-guard.tsx calls useSession", () => {
    const content = readSrc("components/auth/route-guard.tsx");
    expect(content).toMatch(/\buseSession\b/);
  });

  it("route-guard.tsx redirects to /login on unauthenticated status", () => {
    const content = readSrc("components/auth/route-guard.tsx");
    expect(content).toMatch(/unauthenticated/);
    expect(content).toMatch(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// P3 — Parent dashboard unchanged
// ---------------------------------------------------------------------------
describe("P3 – Parent dashboard unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("app/dashboard/parent/page.tsx");
  });

  it("imports selectChild from locationStore", () => {
    expect(content).toMatch(/\bselectChild\b/);
  });

  it("imports selectDriver from locationStore", () => {
    expect(content).toMatch(/\bselectDriver\b/);
  });

  it("renders <LiveMap", () => {
    expect(content).toMatch(/<LiveMap/);
  });

  it("renders Bell (notifications icon)", () => {
    // Bell is used in the 'Recent Updates' section header
    expect(content).toMatch(/\bBell\b/);
  });
});

// ---------------------------------------------------------------------------
// P4 — Driver dashboard unchanged
// ---------------------------------------------------------------------------
describe("P4 – Driver dashboard unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("app/dashboard/driver/page.tsx");
  });

  it("has tripStatus state", () => {
    expect(content).toMatch(/\btripStatus\b/);
  });

  it("has handleStartTrip function", () => {
    expect(content).toMatch(/\bhandleStartTrip\b/);
  });

  it("renders Vehicle Telemetry section", () => {
    expect(content).toMatch(/Vehicle Telemetry/);
  });

  it("renders QrCode quick action", () => {
    expect(content).toMatch(/\bQrCode\b/);
  });
});

// ---------------------------------------------------------------------------
// P5 — Admin dashboard preserves System Health, Action Items, and Live Network
// ---------------------------------------------------------------------------
describe("P5 – Admin dashboard preserves core sections", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("app/dashboard/admin/page.tsx");
  });

  it("passes showFleet prop to LiveMap", () => {
    expect(content).toMatch(/\bshowFleet\b/);
  });

  it("has System Health section", () => {
    expect(content).toMatch(/System Health/);
  });

  it("has Action Items section", () => {
    expect(content).toMatch(/Action Items/);
  });

  it("uses HealthBar sub-component", () => {
    expect(content).toMatch(/\bHealthBar\b/);
  });

  it("uses ActionItem sub-component", () => {
    expect(content).toMatch(/\bActionItem\b/);
  });
});

// ---------------------------------------------------------------------------
// P6 — Map components still exist
// ---------------------------------------------------------------------------
describe("P6 – Map components still exist", () => {
  it("src/components/map/live-map.tsx exists", () => {
    expect(fileExists("src/components/map/live-map.tsx")).toBe(true);
  });

  it("at least one of BusMap.tsx or FleetMarkers.tsx exists", () => {
    const busMap     = fileExists("src/components/map/BusMap.tsx");
    const fleetMarkers = fileExists("src/components/map/FleetMarkers.tsx");
    expect(busMap || fleetMarkers).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// P7 — locationStore selectors are unchanged
// ---------------------------------------------------------------------------
describe("P7 – locationStore selectors are unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("store/locationStore.ts");
  });

  it("exports selectChild", () => {
    expect(content).toMatch(/export\s+const\s+selectChild\b/);
  });

  it("exports selectDriver", () => {
    expect(content).toMatch(/export\s+const\s+selectDriver\b/);
  });

  it("exports selectBus", () => {
    expect(content).toMatch(/export\s+const\s+selectBus\b/);
  });

  it("exports selectRoute", () => {
    expect(content).toMatch(/export\s+const\s+selectRoute\b/);
  });

  it("exports selectFleetBuses", () => {
    expect(content).toMatch(/export\s+const\s+selectFleetBuses\b/);
  });

  it("exports selectAdminStats", () => {
    expect(content).toMatch(/export\s+const\s+selectAdminStats\b/);
  });
});

// ---------------------------------------------------------------------------
// P8 — SessionSync component is unchanged
// ---------------------------------------------------------------------------
describe("P8 – SessionSync component is unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("components/auth/session-sync.tsx");
  });

  it("calls useSession", () => {
    expect(content).toMatch(/\buseSession\b/);
  });

  it("calls login from the auth store", () => {
    expect(content).toMatch(/\blogin\b/);
  });

  it("calls logout from the auth store", () => {
    expect(content).toMatch(/\blogout\b/);
  });
});

// ---------------------------------------------------------------------------
// P9 — Demo engine is present
// ---------------------------------------------------------------------------
describe("P9 – Demo engine is present", () => {
  it("src/hooks/use-demo-engine.ts exists", () => {
    expect(fileExists("src/hooks/use-demo-engine.ts")).toBe(true);
  });

  it("src/data/mock.ts exports DEFAULT_DEMO", () => {
    const content = readSrc("data/mock.ts");
    expect(content).toMatch(/export\s+const\s+DEFAULT_DEMO\b/);
  });
});

// ---------------------------------------------------------------------------
// P10 — Providers wrapper is unchanged
// ---------------------------------------------------------------------------
describe("P10 – Providers wrapper is unchanged", () => {
  let content: string;

  beforeAll(() => {
    content = readSrc("components/providers.tsx");
  });

  it("wraps with SessionProvider", () => {
    expect(content).toMatch(/\bSessionProvider\b/);
  });

  it("wraps with QueryClientProvider", () => {
    expect(content).toMatch(/\bQueryClientProvider\b/);
  });

  it("calls initLocation()", () => {
    expect(content).toMatch(/\binitLocation\b/);
    expect(content).toMatch(/initLocation\s*\(\s*\)/);
  });
});

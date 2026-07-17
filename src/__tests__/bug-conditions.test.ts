/**
 * Bug Condition Exploration Tests
 * =================================
 * These tests encode the CORRECT (expected) behavior for 7 regressions
 * introduced after the NextAuth v5 refactor. They are run against the
 * CURRENT code BEFORE fixes are applied. Failures here confirm a bug
 * exists; passes mean the bug has already been fixed.
 *
 * Tests use fs.readFileSync (static analysis) to avoid needing a DOM / full
 * React render environment.
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "../..");

/** Read a source file relative to the project root */
function readSrc(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, "src", relPath), "utf-8");
}

/** Check whether a file exists (relative to project root) */
function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ---------------------------------------------------------------------------
// R1 — Student dashboard must render LiveMap
// ---------------------------------------------------------------------------
describe("R1 – Student dashboard has LiveMap", () => {
  it("should render <LiveMap in src/app/dashboard/student/page.tsx", () => {
    const content = readSrc("app/dashboard/student/page.tsx");
    // The page must JSX-render the LiveMap component
    expect(content).toMatch(/<LiveMap/);
  });
});

// ---------------------------------------------------------------------------
// R2 — Driver sidebar must have no duplicate hrefs
// ---------------------------------------------------------------------------
describe("R2 – Driver sidebar has no duplicate hrefs", () => {
  it("should have unique hrefs for all driver nav entries in ROLE_NAV.driver", () => {
    const content = readSrc("components/layout/sidebar.tsx");

    // Extract the driver block from ROLE_NAV
    const driverBlockMatch = content.match(/driver:\s*\[([\s\S]*?)\],\s*(?:admin|student|parent):/);
    expect(driverBlockMatch).not.toBeNull();
    const driverBlock = driverBlockMatch![1];

    // Pull all href values from the driver block
    const hrefPattern = /href:\s*["']([^"']+)["']/g;
    const hrefs: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = hrefPattern.exec(driverBlock)) !== null) {
      hrefs.push(m[1]);
    }

    expect(hrefs.length).toBeGreaterThan(0);

    const unique = new Set(hrefs);
    // Duplicate hrefs would mean unique.size < hrefs.length
    expect(unique.size).toBe(hrefs.length);
  });

  it('should NOT have both "Students" and "Attendance" pointing to /attendance/driver', () => {
    const content = readSrc("components/layout/sidebar.tsx");

    // Find the driver block
    const driverBlockMatch = content.match(/driver:\s*\[([\s\S]*?)\],\s*(?:admin|student|parent):/);
    expect(driverBlockMatch).not.toBeNull();
    const driverBlock = driverBlockMatch![1];

    // Count how many times /attendance/driver appears as an href
    const attendanceHrefCount = (driverBlock.match(/href:\s*["']\/attendance\/driver["']/g) || []).length;
    expect(attendanceHrefCount).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// R3 — Parent "My Child" nav href must be /parent/child
// ---------------------------------------------------------------------------
describe('R3 – Parent "My Child" nav href is correct', () => {
  it('should have href="/parent/child" for the "My Child" entry in ROLE_NAV.parent', () => {
    const content = readSrc("components/layout/sidebar.tsx");

    // Isolate the parent nav block - look for a section label "parent:" up to the next role or end
    const parentBlockMatch = content.match(/parent:\s*\[([\s\S]*?)\],\s*(?:driver|admin|student):/);
    expect(parentBlockMatch).not.toBeNull();
    const parentBlock = parentBlockMatch![1];

    // Find the "My Child" entry and extract its href
    const myChildEntryMatch = parentBlock.match(/label:\s*["']My Child["'][^}]*href:\s*["']([^"']+)["']|href:\s*["']([^"']+)["'][^}]*label:\s*["']My Child["']/);
    expect(myChildEntryMatch).not.toBeNull();

    const href = myChildEntryMatch![1] ?? myChildEntryMatch![2];
    expect(href).toBe("/parent/child");
  });

  it("should have a page file at src/app/parent/child/page.tsx", () => {
    const exists = fileExists("src/app/parent/child/page.tsx");
    expect(exists).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// R4 — Admin dashboard must have 7 KPI StatCards including Revenue,
//       Open Complaints, and Route Health
// ---------------------------------------------------------------------------
describe("R4 – Admin dashboard has 7 KPI cards", () => {
  it("should have at least 7 <StatCard occurrences in src/app/dashboard/admin/page.tsx", () => {
    const content = readSrc("app/dashboard/admin/page.tsx");
    const matches = content.match(/<StatCard/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(7);
  });

  it('should mention "Revenue" in src/app/dashboard/admin/page.tsx', () => {
    const content = readSrc("app/dashboard/admin/page.tsx");
    expect(content).toMatch(/Revenue/);
  });

  it('should mention "Complaints" in src/app/dashboard/admin/page.tsx', () => {
    const content = readSrc("app/dashboard/admin/page.tsx");
    expect(content).toMatch(/Complaints/);
  });

  it('should mention "Route Health" in src/app/dashboard/admin/page.tsx', () => {
    const content = readSrc("app/dashboard/admin/page.tsx");
    expect(content).toMatch(/Route Health/);
  });
});

// ---------------------------------------------------------------------------
// R5 — Attendance page title is "Attendance" and "Scanner Mode" is present
// ---------------------------------------------------------------------------
describe('R5 – Attendance page is correctly titled "Attendance"', () => {
  it('should have "Attendance" as the h1 text (not "Student Manifest") in src/app/attendance/driver/page.tsx', () => {
    const content = readSrc("app/attendance/driver/page.tsx");
    // The page title should be "Attendance", not "Student Manifest"
    expect(content).toMatch(/Attendance/);
    expect(content).not.toMatch(/Student Manifest/);
  });

  it('should have a "Scanner Mode" button in src/app/attendance/driver/page.tsx', () => {
    const content = readSrc("app/attendance/driver/page.tsx");
    expect(content).toMatch(/Scanner Mode/);
  });
});

// ---------------------------------------------------------------------------
// R6 — Driver "Students" nav entry href must be /students/driver
// ---------------------------------------------------------------------------
describe('R6 – Driver "Students" nav href is /students/driver', () => {
  it('should have href="/students/driver" for the "Students" entry in ROLE_NAV.driver', () => {
    const content = readSrc("components/layout/sidebar.tsx");

    // Isolate the driver block
    const driverBlockMatch = content.match(/driver:\s*\[([\s\S]*?)\],\s*(?:admin|student|parent):/);
    expect(driverBlockMatch).not.toBeNull();
    const driverBlock = driverBlockMatch![1];

    // Find the "Students" entry and verify its href
    const studentsEntryMatch = driverBlock.match(/label:\s*["']Students["'][^}]*href:\s*["']([^"']+)["']|href:\s*["']([^"']+)["'][^}]*label:\s*["']Students["']/);
    expect(studentsEntryMatch).not.toBeNull();

    const href = studentsEntryMatch![1] ?? studentsEntryMatch![2];
    expect(href).toBe("/students/driver");
  });
});

// ---------------------------------------------------------------------------
// R7 — ROLE_ROUTES correctness
// ---------------------------------------------------------------------------
describe("R7 – ROLE_ROUTES is correct", () => {
  // We read the file as text to avoid needing tsconfig path aliases at import time
  let authContent: string;

  beforeAll(() => {
    authContent = readSrc("lib/auth.ts");
  });

  it("should have /emergency in the driver routes", () => {
    // Find the driver array inside ROLE_ROUTES
    const driverRoutesMatch = authContent.match(/driver:\s*\[([\s\S]*?)\]/);
    expect(driverRoutesMatch).not.toBeNull();
    const driverBlock = driverRoutesMatch![1];
    expect(driverBlock).toMatch(/["']\/emergency["']/);
  });

  it("should NOT have /bus/student in any role's routes", () => {
    expect(authContent).not.toMatch(/["']\/bus\/student["']/);
  });

  it("should have /parent/child in the parent routes", () => {
    const parentRoutesMatch = authContent.match(/parent:\s*\[([\s\S]*?)\]/);
    expect(parentRoutesMatch).not.toBeNull();
    const parentBlock = parentRoutesMatch![1];
    expect(parentBlock).toMatch(/["']\/parent\/child["']/);
  });
});

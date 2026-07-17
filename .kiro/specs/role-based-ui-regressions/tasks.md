# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Role-Based UI Regression Conditions
  - **CRITICAL**: Write these tests BEFORE verifying the fixes — run on the commit _before_ the fix was applied to confirm the bug existed
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each regression exists
  - **Scoped PBT Approach**: Each property is scoped to a concrete failing case to ensure reproducibility (deterministic regressions)

  **Sub-tests to write (one per regression):**

  - **R1 – Student LiveMap absent**: For input `{ page: "/dashboard/student" }`, assert the rendered output contains a `LiveMap` element.
    - Concrete counterexample: Student dashboard renders without `<LiveMap />` between `<DashboardHero>` and the stats grid.
  - **R2 – Driver sidebar duplicate href**: For all `driver` nav items, assert no two entries share the same `href`.
    - Concrete counterexample: both "Students" and "Attendance" resolve to `/attendance/driver`.
  - **R3/R9 – Parent "My Child" wrong href / missing page**: Assert the parent "My Child" nav entry has `href = "/parent/child"` AND a page file exists at `src/app/parent/child/page.tsx`.
    - Concrete counterexample: href points to `/dashboard/parent`; `src/app/parent/child/page.tsx` does not exist.
  - **R4 – Admin dashboard KPI count**: Assert `/dashboard/admin` renders exactly 7 KPI `StatCard` elements including Revenue, Open Complaints, and Route Health.
    - Concrete counterexample: only 4 cards rendered.
  - **R5 – Attendance page conflation + broken scanner**: Assert `/attendance/driver` page title is "Attendance" (not "Student Manifest") and a "Scanner Mode" button is present and opens a modal.
    - Concrete counterexample: page title is "Student Manifest"; scanner button missing or non-functional.
  - **R6 – Driver "Students" href**: Assert the driver "Students" nav item has `href = "/students/driver"` and the page at that path is read-only (no present/absent controls).
    - Concrete counterexample: href is `/attendance/driver`.
  - **R7/R8 – ROLE_ROUTES inconsistency**: Assert `ROLE_ROUTES.driver` includes `/emergency`; assert no role's routes list includes `/bus/student`; assert `ROLE_ROUTES.parent` includes `/parent/child`.
    - Concrete counterexample: `/emergency` absent from driver routes; `/bus/student` present in student or parent routes.

  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unchanged Role Behaviors
  - **IMPORTANT**: Follow observation-first methodology — observe behavior on unfixed code for all non-buggy inputs, then write tests asserting those observations
  - **Observe on unfixed code:**
    - `POST /api/auth` with valid credentials → NextAuth issues JWT, redirects to role dashboard
    - Navigating to a route not in `ROLE_ROUTES[role]` → `RouteGuard` redirects to `/unauthorized`
    - `/dashboard/parent` renders child tracking card, driver info, live map, notifications
    - `/dashboard/driver` renders trip controls, route progress, telemetry, quick actions
    - `/dashboard/admin` renders System Health panel, Action Items panel, Live Network map (with `showFleet`)
    - Map components (`BusMap`, `LiveMap`, `FleetMarkers`) render without errors
    - `useLocationStore` selectors return city/fleet data
    - `SessionSync` syncs NextAuth session to Zustand auth store on mount
    - Demo engine simulates bus movement, ETA, attendance counts
    - `Providers` wrapper supplies all contexts

  - Write property-based tests asserting:
    - For all roles: authentication flow is unchanged (session issued, redirected to correct dashboard)
    - For all roles: unauthorized route access always redirects to `/unauthorized`
    - `/dashboard/parent`, `/dashboard/driver`, `/dashboard/admin` component trees are unchanged
    - All map components render without runtime errors for any valid city/route input
    - `ROLE_ROUTES` does not remove any previously valid (non-buggy) routes

  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Fix for SmartBus role-based UI regressions (7 regressions)

  - [x] 3.1 Add `LiveMap` to Student dashboard
    - In `src/app/dashboard/student/page.tsx`, render `<LiveMap />` between `<DashboardHero />` and the stats grid
    - Wrap with `motion.div` for consistent entry animation
    - _Bug_Condition: isBugCondition(X) where X.page = "/dashboard/student"_
    - _Expected_Behavior: Dashboard renders DashboardHero → LiveMap → stats grid (req 2.1)_
    - _Preservation: Admin LiveMap (showFleet) and all map components must remain unchanged (req 3.5, 3.6)_
    - _Requirements: 1.1, 2.1_

  - [x] 3.2 Fix Driver sidebar — split "Students" and "Attendance" hrefs
    - In `src/components/layout/sidebar.tsx`, set `{ href: "/students/driver", label: "Students" }` and `{ href: "/attendance/driver", label: "Attendance" }` as distinct entries in `ROLE_NAV.driver`
    - _Bug_Condition: isBugCondition(X) where X.role = "driver" AND X.navItem = "Students"_
    - _Expected_Behavior: Two independent nav items with distinct hrefs (req 2.2)_
    - _Preservation: All other ROLE_NAV entries unchanged (req 3.3, 3.4)_
    - _Requirements: 1.2, 2.2_

  - [x] 3.3 Fix Parent "My Child" nav href
    - In `src/components/layout/sidebar.tsx`, set `{ href: "/parent/child", label: "My Child" }` in `ROLE_NAV.parent`
    - _Bug_Condition: isBugCondition(X) where X.role = "parent" AND X.navItem = "My Child"_
    - _Expected_Behavior: Parent "My Child" navigates to /parent/child (req 2.3)_
    - _Preservation: Parent dashboard and all other parent nav entries unchanged (req 3.3)_
    - _Requirements: 1.3, 1.9, 2.3, 2.10_

  - [x] 3.4 Add Revenue, Open Complaints, Route Health KPI cards to Admin dashboard
    - In `src/app/dashboard/admin/page.tsx`, add three new `StatCard` components in the KPI grid using `stats.revenueThisMonth`, `stats.openComplaints`, and `stats.routeHealthPercent`
    - Ensure `selectAdminStats` in `locationStore.ts` exposes these fields
    - _Bug_Condition: isBugCondition(X) where X.page = "/dashboard/admin"_
    - _Expected_Behavior: 7 KPI cards rendered including Revenue, Open Complaints, Route Health (req 2.4)_
    - _Preservation: Existing 4 cards, System Health panel, Action Items panel, Live Network map unchanged (req 3.5)_
    - _Requirements: 1.4, 2.4_

  - [x] 3.5 Separate Driver attendance page from student manifest
    - Rename/refocus `src/app/attendance/driver/page.tsx` to the attendance-marking workflow (title: "Attendance", with present/absent controls and functional "Scanner Mode" button)
    - Create `src/app/students/driver/page.tsx` as a separate read-only student manifest (title: "Student Manifest", no attendance controls)
    - _Bug_Condition: isBugCondition(X) where X.page = "/attendance/driver"_
    - _Expected_Behavior: Attendance page = mark-present/absent workflow with working QR scanner (req 2.5, 2.7); Students page = read-only manifest (req 2.6)_
    - _Preservation: Dashboard driver page unchanged (req 3.4)_
    - _Requirements: 1.5, 1.6, 2.5, 2.6, 2.7_

  - [x] 3.6 Create `/parent/child` page file
    - Create `src/app/parent/child/page.tsx` rendering child profile, boarding status, seat, bus assignment, and journey timeline
    - _Bug_Condition: isBugCondition(X) where X.role = "parent" AND X.navItem = "My Child"_
    - _Expected_Behavior: Dedicated /parent/child page with child profile and journey details (req 2.3, 2.10)_
    - _Preservation: /dashboard/parent unchanged (req 3.3)_
    - _Requirements: 1.9, 2.3, 2.10_

  - [x] 3.7 Clean up ROLE_ROUTES in `src/lib/auth.ts`
    - Add `/emergency` to `ROLE_ROUTES.driver`
    - Add `/students/driver` to `ROLE_ROUTES.driver`
    - Replace any `/bus/student` references with correct routes (`/parent/child` for parent, remove from student)
    - Add `/parent/child` to `ROLE_ROUTES.parent`
    - _Bug_Condition: isBugCondition(X) where X.role = "driver" AND X.route = "/emergency" OR X.route = "/bus/student"_
    - _Expected_Behavior: Driver has /emergency access; no dead /bus/student route; parent has /parent/child (req 2.8, 2.9)_
    - _Preservation: All other role route permissions unchanged; RouteGuard redirect behavior unchanged (req 3.2)_
    - _Requirements: 1.7, 1.8, 2.8, 2.9_

  - [x] 3.8 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - All 7 Role-Based UI Regressions Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior for each regression
    - When all these tests pass, it confirms the expected behavior is satisfied for every regression
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all 7 bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - No Regressions in Unchanged Behaviors
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions introduced)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 4. Build verification — ensure 0 type errors
  - Run `npm run build` (or `next build`) and confirm the build completes with 0 TypeScript errors and 0 ESLint errors
  - Specifically confirm:
    - `src/app/dashboard/student/page.tsx` — `LiveMap` import resolves correctly
    - `src/app/dashboard/admin/page.tsx` — `stats.revenueThisMonth`, `stats.openComplaints`, `stats.routeHealthPercent` are typed in `AdminStats`
    - `src/app/attendance/driver/page.tsx` — no import from deleted/moved code
    - `src/app/students/driver/page.tsx` — `DRIVER_TODAY_STUDENTS` import resolves
    - `src/app/parent/child/page.tsx` — `selectChild`, `selectDriver` selectors resolve
    - `src/components/layout/sidebar.tsx` — all `href` values in `ROLE_NAV` have matching pages
    - `src/lib/auth.ts` — all route strings reference real pages

- [x] 5. Checkpoint — Ensure all tests pass
  - Re-run the full test suite: `npm run test` (or equivalent)
  - Ensure all bug condition exploration tests pass (bugs are fixed)
  - Ensure all preservation tests pass (no regressions)
  - Ensure build is clean (0 errors)
  - Ask the user if any questions arise before closing the spec

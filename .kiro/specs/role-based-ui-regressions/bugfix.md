# Bugfix Requirements Document

## Introduction

After an authentication refactor (NextAuth v5 / Auth.js), eight role-based UI
regressions were introduced into the SmartBus Next.js 14 application. The
authentication layer itself is working correctly; the bugs are confined to the
UI, routing, navigation, and role-specific page content for the four user
roles: Student, Parent, Driver, and Admin. This document captures what is
broken, what the correct behavior must be, and what must remain unchanged.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a Student user navigates to `/dashboard/student` THEN the system
    renders `DashboardHero`, `TripTimeline`, `ETACountdown`, and a weather card
    — the `LiveMap` component is absent from the page.

1.2 WHEN a Driver user opens the sidebar THEN the system shows two navigation
    entries ("Students" and "Attendance") that both carry the href
    `/attendance/driver`, causing both items to activate simultaneously and
    navigate to the same page.

1.3 WHEN a Parent user clicks "My Child" in the sidebar THEN the system
    navigates to `/dashboard/parent` (the parent home dashboard) instead of a
    dedicated child detail page.

1.4 WHEN an Admin user views `/dashboard/admin` THEN the system renders only
    four KPI cards (Total Fleet, Students, Active Drivers, GPS Health) and
    omits the Revenue, Open Complaints, and Route Health cards that were present
    in the reference version.

1.5 WHEN a Driver user navigates to `/attendance/driver` THEN the system
    presents a single merged page titled "Student Manifest" that conflates the
    read-only boarding-status list with the mark-present/absent attendance
    workflow, and the "Scanner Mode" button in the header has no functional
    destination.

1.6 WHEN a Driver user's sidebar "Students" entry is clicked THEN the system
    navigates to `/attendance/driver` (the attendance page) rather than a
    dedicated, view-only student manifest page.

1.7 WHEN the route guard evaluates a Student or Driver navigation request for
    `/emergency` THEN the system behaves inconsistently because `ROLE_ROUTES`
    for `student` lists `/emergency` while `ROLE_ROUTES` for `driver` does not,
    even though both roles require emergency access.

1.8 WHEN the route guard evaluates navigation to `/bus/student` THEN the system
    may allow access to a route that has no corresponding page file, creating a
    dead-end navigation for both the Student and Parent roles that reference it.

1.9 WHEN a Parent user clicks "My Child" in the sidebar THEN the system renders
    no dedicated `/parent/child` (or equivalent) page because that page file
    does not exist in the app directory.

---

### Expected Behavior (Correct)

2.1 WHEN a Student user navigates to `/dashboard/student` THEN the system SHALL
    render `DashboardHero`, followed by an embedded `LiveMap` component, and
    then the stats grid (`TripTimeline`, `ETACountdown`, weather card),
    matching the reference layout.

2.2 WHEN a Driver user opens the sidebar THEN the system SHALL show a "Students"
    entry with href `/students/driver` (or equivalent dedicated route) and a
    separate "Attendance" entry with href `/attendance/driver`, each activating
    independently and navigating to distinct pages.

2.3 WHEN a Parent user clicks "My Child" in the sidebar THEN the system SHALL
    navigate to a dedicated child detail page (e.g. `/parent/child`) that shows
    the child's profile, boarding status, seat number, bus assignment, and
    location history.

2.4 WHEN an Admin user views `/dashboard/admin` THEN the system SHALL render
    all reference KPI cards including Revenue (formatted currency), Open
    Complaints (count), and Route Health (percentage), in addition to the
    currently displayed four cards.

2.5 WHEN a Driver user navigates to `/attendance/driver` THEN the system SHALL
    present an attendance-marking workflow (mark present/absent per student)
    as a distinct view, separate from the read-only student manifest.

2.6 WHEN a Driver user navigates to the "Students" sidebar entry THEN the system
    SHALL open a read-only student manifest page showing each student's name,
    class, seat number, stop, and current boarding status without attendance
    controls.

2.7 WHEN a Driver user activates "Scanner Mode" THEN the system SHALL navigate
    to or display a functional QR-code scanner view for boarding verification.

2.8 WHEN `ROLE_ROUTES` is evaluated for the `driver` role THEN the system SHALL
    include `/emergency` in the allowed routes list, consistent with the
    student role and the driver sidebar nav definition.

2.9 WHEN `ROLE_ROUTES` is evaluated for any role THEN the system SHALL NOT
    reference `/bus/student` as an allowed route because no such page exists;
    the parent role SHALL reference `/parent/child` instead, and the student
    role SHALL have it removed.

2.10 WHEN a Parent user navigates to the child detail page THEN the system SHALL
     render a page file at `/parent/child` (or equivalent) within the app
     directory.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN any user (Student, Parent, Driver, Admin) submits login credentials
    THEN the system SHALL CONTINUE TO authenticate via NextAuth v5, issue a
    JWT session, and redirect to the role-specific dashboard without change.

3.2 WHEN a page is accessed by a user whose role is not permitted THEN the
    system SHALL CONTINUE TO redirect to `/unauthorized` via the `RouteGuard`
    component.

3.3 WHEN the Parent user's `/dashboard/parent` page is rendered THEN the system
    SHALL CONTINUE TO show the child tracking card, assigned driver info, live
    map embed, and recent notifications as currently implemented.

3.4 WHEN a Driver user views `/dashboard/driver` THEN the system SHALL CONTINUE
    TO render trip controls, live route progress, vehicle telemetry, and quick
    actions without modification.

3.5 WHEN the Admin user views the Live Network map on `/dashboard/admin` THEN
    the system SHALL CONTINUE TO render the `LiveMap` (with `showFleet`) and
    all existing System Health and Action Items panels unchanged.

3.6 WHEN the map components (`BusMap`, `LiveMap`, `FleetMarkers`, etc.) are
    rendered THEN the system SHALL CONTINUE TO operate without modification.

3.7 WHEN the `locationStore` or `useLocationStore` selectors are called THEN
    the system SHALL CONTINUE TO return location and fleet data without change.

3.8 WHEN the `SessionSync` component mounts THEN the system SHALL CONTINUE TO
    synchronise NextAuth session state with the Zustand auth store as currently
    implemented.

3.9 WHEN the demo engine is active THEN the system SHALL CONTINUE TO simulate
    bus movement, ETA updates, and attendance counts without modification.

3.10 WHEN the `Providers` component wraps the application THEN the system SHALL
     CONTINUE TO supply all contexts (NextAuth session, theme, stores) without
     change.

---

## Bug Condition Summary

**Bug Condition C(X):** A navigation or render request is a _buggy input_ when
it targets any of the following:

- `/dashboard/student` render (missing LiveMap)
- Driver sidebar nav items (duplicate hrefs)
- Parent "My Child" sidebar entry (wrong href, missing page)
- `/dashboard/admin` render (missing KPI cards)
- `/attendance/driver` render (merged manifest + attendance, non-functional scanner)
- `ROLE_ROUTES` lookup for `driver` emergency access or `/bus/student` dead route

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type NavigationOrRenderRequest
  OUTPUT: boolean

  RETURN (
    X.page = "/dashboard/student"           // R1 – LiveMap missing
    OR X.role = "driver" AND X.navItem = "Students"  // R2 – duplicate href
    OR X.role = "parent" AND X.navItem = "My Child"  // R3 & R8 – wrong href/missing page
    OR X.page = "/dashboard/admin"          // R4 – missing KPI cards
    OR X.page = "/attendance/driver"        // R5 – conflated page + broken scanner
    OR X.role = "driver" AND X.route = "/emergency" AND isRouteAllowed check  // R7
    OR X.route = "/bus/student"             // R7 & R8 – dead route reference
  )
END FUNCTION
```

**Fix Checking Property:**
```pascal
FOR ALL X WHERE isBugCondition(X) DO
  result ← renderOrNavigate'(X)
  ASSERT result satisfies the matching Expected Behavior clause (2.1 – 2.10)
END FOR
```

**Preservation Property:**
```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderOrNavigate(X) = renderOrNavigate'(X)
END FOR
```

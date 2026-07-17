/**
 * src/app/dashboard/page.tsx
 *
 * Server component — reads the session server-side and redirects
 * to the correct role dashboard.
 *
 * Previously this unconditionally redirected to /login, which
 * created a redirect loop for already-authenticated users who
 * navigated to /dashboard directly.
 */
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string })?.role ?? "student";
  redirect(`/dashboard/${role}`);
}

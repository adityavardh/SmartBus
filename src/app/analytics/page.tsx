import { redirect } from "next/navigation";

export default function RedirectPage() {
  redirect("/reports/admin");
}

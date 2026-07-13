/**
 * src/app/api/auth/[...nextauth]/route.ts
 * Connects Auth.js to Next.js App Router.
 * Force Node.js runtime so fs/path work inside the credentials authorize handler.
 */
import { handlers } from "@/auth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;

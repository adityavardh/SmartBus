/**
 * src/types/next-auth.d.ts
 * Extends NextAuth's built-in types to include our custom `role` field.
 */
import type { UserRole } from "@/types";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}

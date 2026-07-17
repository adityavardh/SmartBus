/**
 * src/auth.ts
 * ─────────────────────────────────────────────────────────────
 * Full Auth.js v5 config — Node.js runtime only.
 * Exports: handlers, auth, signIn, signOut
 *
 * NOT imported by middleware.ts — that uses auth.config.ts.
 * ─────────────────────────────────────────────────────────────
 *
 * ── Issues fixed ──────────────────────────────────────────────
 *
 *  1. GOOGLE ROLE INJECTION (fixed)
 *     The login form sets a short-lived `smartbus_oauth_role` cookie before
 *     triggering the Google OAuth redirect.  The signIn callback reads this
 *     cookie via next/headers cookies() to determine the intended role.
 *     Default falls back to "student" if the cookie is missing or invalid.
 *
 *  2. PASSWORD HASHING
 *     Passwords are now hashed with bcrypt (cost 12) on signup and
 *     compared with bcrypt.compare() on login.  Legacy plain-text
 *     passwords in users.json are auto-upgraded on first successful
 *     login (see users-db.ts).
 *
 *  3. CredentialsSignin subclasses (from previous fix — kept)
 *     All error paths throw typed subclasses so the frontend receives
 *     a machine-readable `.code` value in result.error instead of
 *     being redirected to /api/auth/error?error=AccessDenied.
 * ─────────────────────────────────────────────────────────────
 */

import NextAuth, { type User, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types";
import { authConfig } from "@/auth.config";

// ─── Typed error classes ──────────────────────────────────────────────────────

class WrongPasswordError extends CredentialsSignin {
  code = "wrong_password";
}
class NoAccountError extends CredentialsSignin {
  code = "no_account";
}
class WrongRoleError extends CredentialsSignin {
  code = "wrong_role";
}
class AccountExistsError extends CredentialsSignin {
  code = "account_exists";
}
class InvalidInputError extends CredentialsSignin {
  code = "invalid_input";
}

// ─── Demo users (never persisted — no hashing needed for plain-text demo) ─────

const DEMO_USERS = [
  { id: "demo-student", email: "student@demo.com", password: "password123", name: "Adi Kumar",    role: "student" as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi&backgroundColor=0D1B36"   },
  { id: "demo-parent",  email: "parent@demo.com",  password: "password123", name: "Priya Sharma", role: "parent"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED" },
  { id: "demo-driver",  email: "driver@demo.com",  password: "password123", name: "Rahul Sharma", role: "driver"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247" },
  { id: "demo-admin",   email: "admin@demo.com",   password: "password123", name: "Admin",        role: "admin"   as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=EF4444" },
];

const VALID_ROLES: UserRole[] = ["student", "parent", "driver", "admin"];

export function isValidRole(r: unknown): r is UserRole {
  return VALID_ROLES.includes(r as UserRole);
}

// ─── Auth instance ────────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    // ── 1. Email + Password ───────────────────────────────────────────────────
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
        role:     { label: "Role",     type: "text"     },
        name:     { label: "Name",     type: "text"     },
      },

      async authorize(credentials): Promise<User | null> {
        const email    = (credentials?.email    as string)?.toLowerCase().trim();
        const password =  credentials?.password as string;
        const role     =  credentials?.role     as UserRole;
        const name     = (credentials?.name     as string | undefined)?.trim() || undefined;

        if (!email || !password || !isValidRole(role)) {
          console.error("[auth] authorize — invalid input:", {
            hasEmail: !!email, hasPassword: !!password, role,
          });
          throw new InvalidInputError();
        }

        const {
          findUserByEmailAndRole,
          findUserByEmail,
          addUser,
          verifyPassword,
        } = await import("@/lib/users-db");

        // ── Signup path ───────────────────────────────────────────────────────
        if (name) {
          const demoConflict    = DEMO_USERS.find((u) => u.email === email && u.role === role);
          const existingForRole = findUserByEmailAndRole(email, role);

          if (demoConflict || existingForRole) {
            console.error("[auth] signup blocked — already exists:", { email, role });
            throw new AccountExistsError();
          }

          const saved = await addUser({
            id:            `user-${role}-${email}`,
            name,
            email,
            role,
            image:         `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=2E8BFF`,
            plainPassword: password,
          });

          console.log("[auth] signup success:", { email, role });
          return { id: saved.id, name: saved.name, email: saved.email, role, image: saved.image } as User;
        }

        // ── Login — demo accounts (plain-text comparison is fine for demos) ───
        const demoUser = DEMO_USERS.find((u) => u.email === email && u.role === role);
        if (demoUser) {
          if (demoUser.password !== password) {
            console.error("[auth] demo login — wrong password:", { email, role });
            throw new WrongPasswordError();
          }
          console.log("[auth] demo login success:", { email, role });
          return { ...demoUser } as User;
        }

        // ── Login — registered users ──────────────────────────────────────────
        const registeredForRole = findUserByEmailAndRole(email, role);
        if (!registeredForRole) {
          const anyRecord = findUserByEmail(email);
          if (anyRecord) {
            console.error("[auth] login — wrong role:", { email, attemptedRole: role, existingRole: anyRecord.role });
            throw new WrongRoleError();
          }
          console.error("[auth] login — no account:", { email, role });
          throw new NoAccountError();
        }

        const passwordOk = await verifyPassword(password, registeredForRole.password, registeredForRole.id);
        if (!passwordOk) {
          console.error("[auth] login — wrong password:", { email, role });
          throw new WrongPasswordError();
        }

        console.log("[auth] login success:", { email, role, id: registeredForRole.id });
        return {
          id:    registeredForRole.id,
          name:  registeredForRole.name,
          email: registeredForRole.email,
          role:  registeredForRole.role as UserRole,
          image: registeredForRole.image,
        } as User;
      },
    }),

    // ── 2. Google OAuth ───────────────────────────────────────────────────────
    //
    // Role passing:
    //   Before the Google OAuth redirect, the login form sets a short-lived
    //   `smartbus_oauth_role` cookie (max-age 300s, SameSite=Lax).
    //   The signIn callback below reads that cookie via next/headers cookies()
    //   to determine the intended role.  Defaults to "student" if absent.
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    /**
     * signIn — fires for Google after the provider authenticates the user.
     *
     * Role extraction:
     *   Before the Google redirect, the login form sets a short-lived
     *   `smartbus_oauth_role` cookie (max-age 300s, SameSite=Lax).
     *   This callback reads that cookie via next/headers and validates
     *   it against isValidRole. Defaults to "student" if absent or invalid.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const { upsertOAuthUser } = await import("@/lib/users-db");

      const email = (user.email ?? "").toLowerCase().trim();
      if (!email) {
        console.error("[auth] Google signIn — no email on Google account");
        return false;
      }

      // ── Read the role from the cookie set by the login form before OAuth redirect ──
      let role: UserRole = "student";
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const raw = cookieStore.get("smartbus_oauth_role")?.value ?? "";
        if (isValidRole(raw)) role = raw;
      } catch {
        // next/headers not available in this context — keep default
      }

      const { isNew } = upsertOAuthUser({
        id:    `oauth-${role}-${email}`,
        name:  user.name  ?? profile?.name  ?? email,
        email,
        role,
        image: user.image ?? (profile as { picture?: string })?.picture ?? "",
      });

      console.log(`[auth] Google ${isNew ? "signup" : "login"}:`, { email, role });

      // Attach role to the user object so the jwt() callback can read it
      (user as User & { role: UserRole }).role = role;

      return true;
    },

    // ── Persist role inside the JWT ───────────────────────────────────────────
    async jwt({ token, user }) {
      if (user) {
        token.role    = (user as User & { role?: UserRole }).role ?? "student";
        token.name    = user.name  ?? token.name;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },

    // ── Expose role on the session object ─────────────────────────────────────
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: UserRole }).role =
          (token.role ?? "student") as UserRole;
        session.user.name  = (token.name    as string)  ?? session.user.name;
        session.user.image = (token.picture as string)  ?? session.user.image;
      }
      return session;
    },
  },
});

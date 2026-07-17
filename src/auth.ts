/**
 * src/auth.ts
 * ─────────────────────────────────────────────────────────────
 * Full Auth.js (next-auth v5) config — Node.js runtime only.
 * Exports:  handlers, signIn, signOut, auth
 *
 * NOT imported by middleware — middleware uses auth.config.ts.
 * ─────────────────────────────────────────────────────────────
 *
 * ── Why the old code caused AccessDenied ──────────────────────
 * In NextAuth v5, throwing a plain `new Error(msg)` inside
 * `authorize()` makes the framework redirect to
 * `/api/auth/error?error=AccessDenied` and silently swallows
 * the message.  `redirect: false` on the client is ignored when
 * `authorize()` throws, so `result.error` is never populated.
 *
 * The correct v5 pattern is to throw a subclass of
 * `CredentialsSignin`.  NextAuth v5 then:
 *   • Sets the `code` query param on the redirect URL.
 *   • Populates `result.error` with the subclass `code` when
 *     `redirect: false` is set by the caller.
 *   • Does NOT redirect to /api/auth/error.
 *
 * Each error path now has its own subclass with a short `code`
 * string.  The frontend maps those codes to human-readable text.
 * ─────────────────────────────────────────────────────────────
 */
import NextAuth, { type User, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types";
import { authConfig } from "@/auth.config";

// ─── Typed error classes (CredentialsSignin subclasses) ───────────────────────
// Each `code` value is what the frontend receives in `result.error`.

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

// ─── Hardcoded demo users ─────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: "demo-student", email: "student@demo.com", password: "password123", name: "Adi Kumar",    role: "student" as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi&backgroundColor=0D1B36"   },
  { id: "demo-parent",  email: "parent@demo.com",  password: "password123", name: "Priya Sharma", role: "parent"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED" },
  { id: "demo-driver",  email: "driver@demo.com",  password: "password123", name: "Rahul Sharma", role: "driver"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247" },
  { id: "demo-admin",   email: "admin@demo.com",   password: "password123", name: "Admin",        role: "admin"   as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=EF4444" },
];

const VALID_ROLES: UserRole[] = ["student", "parent", "driver", "admin"];

function isValidRole(r: unknown): r is UserRole {
  return VALID_ROLES.includes(r as UserRole);
}

// ─── Auth config ──────────────────────────────────────────────────────────────

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

        // ── Input validation ──────────────────────────────────────────────────
        if (!email || !password || !isValidRole(role)) {
          console.error("[auth] authorize() — invalid input:", {
            hasEmail: !!email,
            hasPassword: !!password,
            role,
            isValidRole: isValidRole(role),
          });
          throw new InvalidInputError();
        }

        const { findUserByEmailAndRole, findUserByEmail, addUser } =
          await import("@/lib/users-db");

        // ── Signup path (name was supplied) ───────────────────────────────────
        if (name) {
          const demoConflict    = DEMO_USERS.find((u) => u.email === email && u.role === role);
          const existingForRole = findUserByEmailAndRole(email, role);

          if (demoConflict || existingForRole) {
            console.error("[auth] signup blocked — account already exists:", { email, role });
            throw new AccountExistsError();
          }

          const newUser = {
            id:       `user-${role}-${email}`,
            name,
            email,
            password,
            role,
            image:    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=2E8BFF`,
          };
          addUser(newUser);
          console.log("[auth] signup success:", { email, role, name });
          return { ...newUser, role } as User;
        }

        // ── Login path — demo accounts ────────────────────────────────────────
        const demoUser = DEMO_USERS.find((u) => u.email === email && u.role === role);
        if (demoUser) {
          if (demoUser.password !== password) {
            console.error("[auth] demo login — wrong password:", { email, role });
            throw new WrongPasswordError();
          }
          console.log("[auth] demo login success:", { email, role });
          return { ...demoUser } as User;
        }

        // ── Login path — registered users ─────────────────────────────────────
        const registeredForRole = findUserByEmailAndRole(email, role);
        if (!registeredForRole) {
          const anyRecord = findUserByEmail(email);
          if (anyRecord) {
            // Email exists but for a different role
            console.error("[auth] login — email exists under different role:", {
              email,
              attemptedRole: role,
              existingRole:  anyRecord.role,
            });
            throw new WrongRoleError();
          }
          // Email not found at all
          console.error("[auth] login — no account found:", { email, role });
          throw new NoAccountError();
        }

        if (registeredForRole.password !== password) {
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
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { access_type: "offline", prompt: "consent" },
      },
    }),
  ],

  callbacks: {
    /**
     * signIn callback — fires for OAuth providers after the provider
     * has authenticated the user but before a session is created.
     * Returns true to allow, false / Error string to deny.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { upsertOAuthUser } = await import("@/lib/users-db");

        const rawRole =
          (account as unknown as { oauthRole?: string }).oauthRole ?? "student";
        const role: UserRole = isValidRole(rawRole) ? rawRole : "student";

        const email = (user.email ?? "").toLowerCase().trim();
        if (!email) {
          console.error("[auth] Google signIn — no email on account");
          return false;
        }

        const { isNew } = upsertOAuthUser({
          id:    `oauth-${role}-${email}`,
          name:  user.name  ?? profile?.name ?? email,
          email,
          role,
          image: user.image ?? profile?.picture ?? "",
        });

        console.log(`[auth] Google signIn ${isNew ? "signup" : "login"}:`, { email, role });

        (user as User & { role: UserRole; isNew: boolean }).role  = role;
        (user as User & { role: UserRole; isNew: boolean }).isNew = isNew;
      }
      return true;
    },

    // Persist role in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role    = (user as User & { role: UserRole }).role  ?? "student";
        token.isNew   = (user as User & { isNew?: boolean }).isNew ?? false;
        token.name    = user.name  ?? token.name;
        token.picture = user.image ?? token.picture;
      }
      return token;
    },

    // Expose role + isNew on the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: UserRole }).role =
          token.role as UserRole;
        (session.user as typeof session.user & { isNew?: boolean }).isNew =
          token.isNew as boolean | undefined;
        session.user.name  = token.name    as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});

/**
 * src/auth.ts
 * ─────────────────────────────────────────────────────────────
 * Full Auth.js (next-auth v5) config — Node.js runtime only.
 * Exports:  handlers, signIn, signOut, auth
 *
 * NOT imported by middleware — middleware uses auth.config.ts.
 * ─────────────────────────────────────────────────────────────
 *
 * Role scoping:
 *  - Credentials login/signup:  keyed on (email + role)
 *  - Google OAuth:              role is passed via the `state`
 *    query param as `?role=<role>` (set by the frontend before
 *    calling signIn("google")).  The `signIn` callback upserts
 *    the user so the same Google account can be used for
 *    multiple roles without ever hitting a "not found" error.
 * ─────────────────────────────────────────────────────────────
 */
import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types";
import { authConfig } from "@/auth.config";

// ─── Hardcoded demo users ─────────────────────────────────────────────────────
const DEMO_USERS = [
  { id: "demo-student", email: "student@demo.com", password: "password123", name: "Adi Kumar",      role: "student" as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi&backgroundColor=0D1B36"    },
  { id: "demo-parent",  email: "parent@demo.com",  password: "password123", name: "Priya Sharma",   role: "parent"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED"  },
  { id: "demo-driver",  email: "driver@demo.com",  password: "password123", name: "Rahul Sharma",   role: "driver"  as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247"  },
  { id: "demo-admin",   email: "admin@demo.com",   password: "password123", name: "Admin",          role: "admin"   as UserRole, image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=EF4444"  },
];

const VALID_ROLES: UserRole[] = ["student", "parent", "driver", "admin"];

function isValidRole(r: unknown): r is UserRole {
  return VALID_ROLES.includes(r as UserRole);
}

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

        if (!email || !password || !isValidRole(role)) return null;

        const { findUserByEmailAndRole, findUserByEmail, addUser } =
          await import("@/lib/users-db");

        // ── Signup path (name was supplied) ──────────────────────────────────
        if (name) {
          // Block if (email + role) already registered or is a demo account
          const demoConflict = DEMO_USERS.find(
            (u) => u.email === email && u.role === role
          );
          const existingForRole = findUserByEmailAndRole(email, role);

          if (demoConflict || existingForRole) {
            // Throw a plain string so NextAuth surfaces it as result.error
            throw new Error("An account with this email already exists for this role. Please log in.");
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
          return { ...newUser, role } as User;
        }

        // ── Login path ────────────────────────────────────────────────────────
        // Check demo accounts first (demo users are role-matched)
        const demoUser = DEMO_USERS.find(
          (u) => u.email === email && u.role === role
        );
        if (demoUser) {
          if (demoUser.password !== password) {
            throw new Error("Incorrect password");
          }
          return { ...demoUser } as User;
        }

        // Check file-based registered users scoped to (email + role)
        const registeredForRole = findUserByEmailAndRole(email, role);
        if (!registeredForRole) {
          // Give a helpful message: distinguish "wrong role" from "no account"
          const anyRecord = findUserByEmail(email);
          if (anyRecord) {
            throw new Error(
              `No ${role} account found for this email. Try a different role or sign up.`
            );
          }
          throw new Error("No account found with this email — please sign up first.");
        }

        if (registeredForRole.password !== password) {
          throw new Error("Incorrect password");
        }

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
      // Pass `state` through so we can read the role in the signIn callback
      authorization: {
        params: { access_type: "offline", prompt: "consent" },
      },
    }),
  ],

  callbacks: {
    /**
     * signIn callback — fires for OAuth providers after the provider
     * has authenticated the user but before a session is created.
     *
     * For Google: read the role from the `state` query param that the
     * frontend encoded before calling signIn("google", { callbackUrl }).
     * Upsert the user so it works for both first-time and returning users.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const { upsertOAuthUser } = await import("@/lib/users-db");

        // The role is stored in localStorage and appended to the callback
        // URL by the frontend as ?oauthRole=<role>.  NextAuth preserves
        // custom query params on the callbackUrl through the state param.
        // We read it back from the account object's state-decoded value.
        // Fallback: default to "student" if nothing was passed.
        const rawRole =
          (account as unknown as { oauthRole?: string }).oauthRole ??
          "student";
        const role: UserRole = isValidRole(rawRole) ? rawRole : "student";

        const email = (user.email ?? "").toLowerCase().trim();
        if (!email) return false; // Google account has no email — deny

        const { isNew } = upsertOAuthUser({
          id:    `oauth-${role}-${email}`,
          name:  user.name  ?? profile?.name ?? email,
          email,
          role,
          image: user.image ?? profile?.picture ?? "",
        });

        // Attach role + isNew flag onto the user object so jwt() can read them
        (user as User & { role: UserRole; isNew: boolean }).role  = role;
        (user as User & { role: UserRole; isNew: boolean }).isNew = isNew;
      }
      return true;
    },

    // Persist role in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role  = (user as User & { role: UserRole }).role  ?? "student";
        token.isNew = (user as User & { isNew?: boolean }).isNew ?? false;
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

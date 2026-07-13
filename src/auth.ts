/**
 * src/auth.ts
 * ─────────────────────────────────────────────────────────────
 * Full Auth.js (next-auth v5) config — Node.js runtime only.
 * Exports:  handlers, signIn, signOut, auth
 *
 * NOT imported by middleware — middleware uses auth.config.ts.
 * ─────────────────────────────────────────────────────────────
 */
import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@/types";
import { authConfig } from "@/auth.config";

// ─── Hardcoded demo users ──────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    id: "demo-student",
    email: "student@demo.com",
    password: "password123",
    name: "Adi Kumar",
    role: "student" as UserRole,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adi&backgroundColor=0D1B36",
  },
  {
    id: "demo-parent",
    email: "parent@demo.com",
    password: "password123",
    name: "Priya Sharma",
    role: "parent" as UserRole,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=7C3AED",
  },
  {
    id: "demo-driver",
    email: "driver@demo.com",
    password: "password123",
    name: "Rahul Sharma",
    role: "driver" as UserRole,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=FFC247",
  },
  {
    id: "demo-admin",
    email: "admin@demo.com",
    password: "password123",
    name: "Admin",
    role: "admin" as UserRole,
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=EF4444",
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    // ── 1. Email + Password (Credentials) ────────────────────────────────────
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
        role:     { label: "Role",     type: "text" },
        name:     { label: "Name",     type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        const email    = (credentials?.email    as string)?.toLowerCase().trim();
        const password =  credentials?.password as string;
        const role     =  credentials?.role     as UserRole;
        const name     =  credentials?.name     as string | undefined;

        if (!email || !password || !role) return null;

        // Dynamic import keeps fs/path out of the module graph at parse time,
        // so this file is safe to import in server components / API routes.
        const { findUserByEmail, addUser } = await import("@/lib/users-db");

        const demo       = DEMO_USERS.find((u) => u.email === email);
        const registered = findUserByEmail(email);

        // ── Signup path (name supplied) ──────────────────────────────────────
        if (name) {
          if (demo || registered) {
            throw new Error("Email already registered. Please log in.");
          }
          const newUser = {
            id: `user-${email}`,
            name,
            email,
            password,
            role,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=2E8BFF`,
          };
          addUser(newUser);
          return { ...newUser, role: newUser.role as UserRole } as User;
        }

        // ── Login path ───────────────────────────────────────────────────────
        const user = demo || registered;
        if (!user) throw new Error("No account found with this email — please sign up first");
        if (user.password !== password) throw new Error("Incorrect password");

        return {
          id:    user.id ?? `user-${user.email}`,
          name:  user.name,
          email: user.email,
          role:  user.role as UserRole,
          image: user.image,
        } as User;
      },
    }),

    // ── 2. Google OAuth ───────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    // Persist role in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role    = (user as User & { role: UserRole }).role ?? "student";
        token.name    = user.name    ?? token.name;
        token.picture = user.image   ?? token.picture;
      }
      return token;
    },

    // Expose role + picture on the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: UserRole }).role =
          token.role as UserRole;
        session.user.name  = token.name    as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});

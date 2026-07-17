/**
 * src/lib/users-db.ts
 * ─────────────────────────────────────────────────────────────
 * File-backed user store.  Node.js runtime only — never
 * imported in Edge / client code.
 *
 * ── Security fixes ────────────────────────────────────────────
 *  1. Passwords are hashed with bcryptjs (cost 12) on write and
 *     compared with bcrypt.compare() on read.  Plain-text
 *     passwords from the old file are detected by the absence of
 *     a "$2" bcrypt prefix and are auto-migrated on first login.
 *
 * ── Vercel / serverless fix ────────────────────────────────────
 *  2. Vercel's serverless runtime mounts a read-only filesystem.
 *     fs.writeFileSync() would throw EROFS and silently swallow
 *     new registrations.  We now:
 *       a) Try to write to the file.
 *       b) On failure, fall back to an in-memory store so the
 *          current request (signup / OAuth upsert) succeeds.
 *       c) Log a clear warning so the developer knows persistence
 *          is disabled.
 *     For true production persistence, swap the file layer for a
 *     database (Postgres/MongoDB/Upstash) by replacing the four
 *     exported functions below — the rest of the codebase stays
 *     identical.
 * ─────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string;
  name: string;
  /** Always lowercase-trimmed */
  email: string;
  /** bcrypt hash, or empty string for OAuth-only accounts */
  password: string;
  role: string;
  image: string;
}

// ─── In-memory fallback (used when the filesystem is read-only) ───────────────

let memoryStore: StoredUser[] | null = null;

// ─── File path ────────────────────────────────────────────────────────────────

const FILE_PATH = path.join(process.cwd(), "src/data/users.json");

// ─── I/O ──────────────────────────────────────────────────────────────────────

export function readUsers(): StoredUser[] {
  // If we already used the in-memory fallback this process, keep using it
  if (memoryStore !== null) return memoryStore;

  try {
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      return JSON.parse(raw) as StoredUser[];
    }
  } catch {
    // File missing or corrupt — start fresh
  }
  return [];
}

function writeUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
    // Clear any in-memory fallback — file is now the source of truth
    memoryStore = null;
  } catch {
    // Read-only filesystem (Vercel production / preview).
    // Fall back to in-memory so the current request still works.
    console.warn(
      "[users-db] Filesystem is read-only. " +
      "User data is stored in memory only for this serverless invocation. " +
      "For durable persistence, replace users-db.ts with a database adapter."
    );
    memoryStore = users;
  }
}

// ─── Password helpers ─────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

/** Hash a plain-text password.  Always async to avoid blocking the event loop. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Compare a plain-text attempt against a stored value.
 * Handles both bcrypt hashes and the legacy plain-text passwords that
 * exist in users.json from before this fix.  On a successful plain-text
 * match the stored record is silently upgraded to a bcrypt hash.
 */
export async function verifyPassword(
  plain: string,
  stored: string,
  userId: string
): Promise<boolean> {
  // bcrypt hashes always start with "$2a$" or "$2b$"
  if (stored.startsWith("$2")) {
    return bcrypt.compare(plain, stored);
  }

  // Legacy plain-text — compare and then upgrade
  if (plain === stored) {
    // Upgrade in the background; don't block the login response
    hashPassword(plain)
      .then((hash) => {
        const users = readUsers();
        const idx = users.findIndex((u) => u.id === userId);
        if (idx !== -1) {
          users[idx].password = hash;
          writeUsers(users);
          console.log("[users-db] Upgraded plain-text password to bcrypt for user", userId);
        }
      })
      .catch(() => {/* best-effort */});
    return true;
  }

  return false;
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function findUserByEmail(email: string): StoredUser | undefined {
  return readUsers().find((u) => u.email === email);
}

export function findUserByEmailAndRole(
  email: string,
  role: string
): StoredUser | undefined {
  return readUsers().find((u) => u.email === email && u.role === role);
}

// ─── Write helpers ────────────────────────────────────────────────────────────

/**
 * Register a new credentials user.
 * The caller must supply a PLAIN-TEXT password; this function hashes it.
 * Throws if (email + role) already exists.
 */
export async function addUser(
  user: Omit<StoredUser, "password"> & { plainPassword: string }
): Promise<StoredUser> {
  const users = readUsers();
  const exists = users.some(
    (u) => u.email === user.email && u.role === user.role
  );
  if (exists) {
    throw new Error(
      `An account for ${user.email} as ${user.role} already exists.`
    );
  }

  const hashed = await hashPassword(user.plainPassword);
  const newUser: StoredUser = {
    id:       user.id,
    name:     user.name,
    email:    user.email,
    password: hashed,
    role:     user.role,
    image:    user.image,
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

/**
 * Insert-or-update an OAuth user (no password).
 * Refreshes name/image on subsequent logins.
 */
export function upsertOAuthUser(user: Omit<StoredUser, "password">): {
  user: StoredUser;
  isNew: boolean;
} {
  const users = readUsers();
  const idx = users.findIndex(
    (u) => u.email === user.email && u.role === user.role
  );

  if (idx !== -1) {
    users[idx] = { ...users[idx], name: user.name, image: user.image };
    writeUsers(users);
    return { user: users[idx], isNew: false };
  }

  const newUser: StoredUser = { ...user, password: "" };
  users.push(newUser);
  writeUsers(users);
  return { user: newUser, isNew: true };
}

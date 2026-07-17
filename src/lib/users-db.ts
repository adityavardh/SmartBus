/**
 * src/lib/users-db.ts
 * ─────────────────────────────────────────────────────────────
 * Simple file-based "database" for registered users.
 * Node.js only — never imported in Edge/client code.
 *
 * Key design decision: a user is uniquely identified by
 * (email + role), NOT just email.  This lets the same Google
 * account sign in as both a "parent" and a "student" — two
 * separate records, two separate sessions.
 * ─────────────────────────────────────────────────────────────
 */
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "src/data/users.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // empty string for OAuth users
  role: string;
  image: string;
}

// ─── I/O helpers ─────────────────────────────────────────────────────────────

export function readUsers(): StoredUser[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) as StoredUser[];
    }
  } catch {
    // file missing or corrupt — start fresh
  }
  return [];
}

export function writeUsers(users: StoredUser[]): void {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Original helper — kept for backwards compat.
 * Returns the FIRST record that matches the email regardless of role.
 * Used only for the "does this email exist at all?" check.
 */
export function findUserByEmail(email: string): StoredUser | undefined {
  return readUsers().find((u) => u.email === email);
}

/**
 * Role-scoped lookup — the primary lookup for login / OAuth upsert.
 * Returns undefined when no record exists for (email + role) pair.
 */
export function findUserByEmailAndRole(
  email: string,
  role: string
): StoredUser | undefined {
  return readUsers().find(
    (u) => u.email === email && u.role === role
  );
}

// ─── Write helpers ────────────────────────────────────────────────────────────

/**
 * Add a new user record.
 * Throws if an (email + role) record already exists — prevents
 * accidental double-registration on the credentials signup path.
 */
export function addUser(user: StoredUser): void {
  const users = readUsers();
  const exists = users.some(
    (u) => u.email === user.email && u.role === user.role
  );
  if (exists) {
    throw new Error(
      `An account for ${user.email} as ${user.role} already exists.`
    );
  }
  users.push(user);
  writeUsers(users);
}

/**
 * Insert-or-update a user by (email + role).
 * Used by the Google OAuth flow so that subsequent Google sign-ins
 * refresh the user's name/avatar rather than failing.
 * Returns the final stored record and whether it was newly created.
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
    // Update mutable fields (name, image may change in Google profile)
    users[idx] = {
      ...users[idx],
      name: user.name,
      image: user.image,
    };
    writeUsers(users);
    return { user: users[idx], isNew: false };
  }

  // New user for this role
  const newUser: StoredUser = { ...user, password: "" };
  users.push(newUser);
  writeUsers(users);
  return { user: newUser, isNew: true };
}

/**
 * src/lib/users-db.ts
 * ─────────────────────────────────────────────────────────────
 * Simple file-based "database" for registered users.
 * Node.js only — never imported in Edge/client code.
 * ─────────────────────────────────────────────────────────────
 */
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "src/data/users.json");

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  image: string;
}

export function readUsers(): StoredUser[] {
  try {
    if (fs.existsSync(FILE_PATH)) {
      return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8")) as StoredUser[];
    }
  } catch {
    // file missing or corrupt — return empty
  }
  return [];
}

export function writeUsers(users: StoredUser[]): void {
  fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2));
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return readUsers().find((u) => u.email === email);
}

export function addUser(user: StoredUser): void {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
}

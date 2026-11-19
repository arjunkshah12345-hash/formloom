import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { uid } from "./schema";

export const SESSION_COOKIE = "fl_session";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string };

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64url");
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, "base64url"), expected.length, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return crypto.timingSafeEqual(expected, actual);
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

function secureCookies() {
  if (process.env.SECURE_COOKIES) return process.env.SECURE_COOKIES === "true";
  return (process.env.APP_URL ?? "").startsWith("https://");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db()
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .run(sha256(token), userId, expires);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE id = ?").run(sha256(token));
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, s.expires_at FROM sessions s
       JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    )
    .get(sha256(token)) as (User & { expires_at: number }) | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name };
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function findUserByEmail(email: string) {
  return db()
    .prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as (User & { password_hash: string }) | undefined;
}

export function insertUser(email: string, name: string, password: string): User {
  const user = { id: uid("u"), email: email.toLowerCase().trim(), name: name.trim() };
  db()
    .prepare("INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(user.id, user.email, user.name, hashPassword(password), Date.now());
  return user;
}

export function userCount(): number {
  return (db().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

/** Authenticate a REST API request via `Authorization: Bearer fl_…`. */
export function userFromApiKey(header: string | null): User | null {
  const token = header?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT u.id, u.email, u.name, k.id AS key_id FROM api_keys k
       JOIN users u ON u.id = k.user_id WHERE k.token_hash = ?`,
    )
    .get(sha256(token)) as (User & { key_id: string }) | undefined;
  if (!row) return null;
  db().prepare("UPDATE api_keys SET last_used_at = ? WHERE id = ?").run(Date.now(), row.key_id);
  return { id: row.id, email: row.email, name: row.name };
}

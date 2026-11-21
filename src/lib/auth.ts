import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, onCloudflare } from "./db";
import { uid } from "./schema";

export const SESSION_COOKIE = "fl_session";
const SESSION_DAYS = 30;

export type User = { id: string; email: string; name: string };

/** PBKDF2 iterations for the hosted version, where scrypt's memory and CPU cost don't fit a Worker. */
const PBKDF2_ITERATIONS = 100_000;

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, bytes: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new Uint8Array(salt), iterations },
    key,
    bytes * 8,
  );
  return Buffer.from(bits);
}

/** scrypt when self-hosted; PBKDF2-SHA256 on Cloudflare. Both formats verify everywhere. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  if (onCloudflare()) {
    const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS, 32);
    return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
  }
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  let expected: Buffer;
  let actual: Buffer;
  if (parts[0] === "scrypt" && parts.length === 3) {
    expected = Buffer.from(parts[2], "base64url");
    actual = crypto.scryptSync(password, Buffer.from(parts[1], "base64url"), expected.length, {
      N: 16384,
      r: 8,
      p: 1,
    });
  } else if (parts[0] === "pbkdf2" && parts.length === 4) {
    const iterations = Number(parts[1]);
    if (!Number.isInteger(iterations) || iterations < 1) return false;
    expected = Buffer.from(parts[3], "base64url");
    actual = await pbkdf2(password, Buffer.from(parts[2], "base64url"), iterations, expected.length);
  } else {
    return false;
  }
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function secureCookies() {
  if (process.env.SECURE_COOKIES) return process.env.SECURE_COOKIES === "true";
  return (process.env.APP_URL ?? "").startsWith("https://");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_DAYS * 864e5;
  await (await db()).run("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", sha256(token), userId, expires);
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
  if (token) await (await db()).run("DELETE FROM sessions WHERE id = ?", sha256(token));
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await (await db()).get<User & { expires_at: number }>(
    `SELECT u.id, u.email, u.name, s.expires_at FROM sessions s
     JOIN users u ON u.id = s.user_id WHERE s.id = ?`,
    sha256(token),
  );
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name };
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function findUserByEmail(email: string) {
  return (await db()).get<User & { password_hash: string }>(
    "SELECT id, email, name, password_hash FROM users WHERE email = ?",
    email.toLowerCase().trim(),
  );
}

/** `password` is null for accounts that only sign in with Google; an empty hash never verifies. */
export async function insertUser(
  email: string,
  name: string,
  password: string | null,
  googleId: string | null = null,
): Promise<User> {
  const user = { id: uid("u"), email: email.toLowerCase().trim(), name: name.trim() };
  await (await db()).run(
    "INSERT INTO users (id, email, name, password_hash, google_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    user.id,
    user.email,
    user.name,
    password === null ? "" : await hashPassword(password),
    googleId,
    Date.now(),
  );
  return user;
}

export async function findUserByGoogleId(googleId: string) {
  return (await db()).get<User>("SELECT id, email, name FROM users WHERE google_id = ?", googleId);
}

export async function linkGoogle(userId: string, googleId: string) {
  await (await db()).run("UPDATE users SET google_id = ? WHERE id = ?", googleId, userId);
}

export async function userCount(): Promise<number> {
  return (await (await db()).get<{ n: number }>("SELECT COUNT(*) AS n FROM users"))?.n ?? 0;
}

/** Authenticate a REST API request via `Authorization: Bearer fl_…`. */
export async function userFromApiKey(header: string | null): Promise<User | null> {
  const token = header?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return null;
  const d = await db();
  const row = await d.get<User & { key_id: string }>(
    `SELECT u.id, u.email, u.name, k.id AS key_id FROM api_keys k
     JOIN users u ON u.id = k.user_id WHERE k.token_hash = ?`,
    sha256(token),
  );
  if (!row) return null;
  await d.run("UPDATE api_keys SET last_used_at = ? WHERE id = ?", Date.now(), row.key_id);
  return { id: row.id, email: row.email, name: row.name };
}

import "server-only";
import { headers } from "next/headers";

export async function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/** Where the source lives; override for forks. */
export const REPO_URL = (process.env.REPO_URL ?? "https://github.com/arjunkshah12345-hash/formloom").replace(/\/$/, "");

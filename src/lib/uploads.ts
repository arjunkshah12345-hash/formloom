import "server-only";
import { cloudflareEnv, onCloudflare } from "./db";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const EXT_MIME = Object.fromEntries(Object.entries(MIME_EXT).map(([m, e]) => [e, m]));

async function uploadDir() {
  const path = await import("node:path");
  return process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
}

/** Stores an image: on disk when self-hosted, in Workers KV on Cloudflare. */
export async function saveUpload(name: string, bytes: ArrayBuffer) {
  if (onCloudflare()) {
    await (await cloudflareEnv()).UPLOADS.put(name, bytes);
    return;
  }
  const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const dir = await uploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ dir, name), new Uint8Array(bytes));
}

export async function readUpload(name: string): Promise<Uint8Array | null> {
  if (onCloudflare()) {
    const value = await (await cloudflareEnv()).UPLOADS.get(name, "arrayBuffer");
    return value ? new Uint8Array(value) : null;
  }
  const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  try {
    return new Uint8Array(await fs.readFile(path.join(/*turbopackIgnore: true*/ await uploadDir(), name)));
  } catch {
    return null;
  }
}

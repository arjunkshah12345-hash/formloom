import fs from "node:fs/promises";
import path from "node:path";
import { EXT_MIME, UPLOAD_DIR } from "@/lib/uploads";

export async function GET(_: Request, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  const m = name.match(/^[a-z0-9]+\.([a-z]+)$/);
  const mime = m && EXT_MIME[m[1]];
  if (!m || !mime) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

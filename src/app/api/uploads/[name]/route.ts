import { EXT_MIME, readUpload } from "@/lib/uploads";

export async function GET(_: Request, ctx: RouteContext<"/api/uploads/[name]">) {
  const { name } = await ctx.params;
  const m = name.match(/^[a-z0-9]+\.([a-z]+)$/);
  const mime = m && EXT_MIME[m[1]];
  if (!m || !mime) return new Response("Not found", { status: 404 });
  const buf = await readUpload(name);
  if (!buf) return new Response("Not found", { status: 404 });
  return new Response(buf as BodyInit, {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
  });
}

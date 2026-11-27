// OpenNext only caches prerendered route handlers for static paths, so the per-post
// share cards (/blog/[slug]/opengraph-image) would render on every request and can
// blow the Worker's CPU budget. Next already prerendered them, so ship those PNGs
// as static assets, which Cloudflare serves before the Worker runs.
import { copyFileSync, existsSync, mkdirSync, readdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const src = ".next/server/app/blog";
const out = ".open-next/assets/blog";
let n = 0;
for (const slug of readdirSync(src)) {
  const body = join(src, slug, "opengraph-image.body");
  if (!existsSync(body)) continue;
  mkdirSync(join(out, slug), { recursive: true });
  copyFileSync(body, join(out, slug, "opengraph-image"));
  n++;
}
appendFileSync(".open-next/assets/_headers", "/blog/*/opengraph-image\n  Content-Type: image/png\n  Cache-Control: public, max-age=3600\n");
console.log(`static-og: ${n} blog share cards`);

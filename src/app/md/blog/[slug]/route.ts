import { getPost, POSTS } from "@/content/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

/** The article as Markdown, for AI agents (served at /blog/<slug>.md). */
export async function GET(_req: Request, ctx: RouteContext<"/md/blog/[slug]">) {
  const post = getPost((await ctx.params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const faq = post.faq.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");
  const md = `# ${post.title}\n\n> ${post.tldr}\n\nSource: ${SITE_URL}/blog/${post.slug} · Published ${post.date}\n\n${post.body.trim()}\n${
    faq ? `\n## Frequently asked questions\n\n${faq}\n` : ""
  }`;
  return new Response(md, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}

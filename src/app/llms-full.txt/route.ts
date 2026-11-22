import { POSTS } from "@/content/blog";
import { llmsTxt } from "@/lib/agent-facts";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** llms.txt followed by the full text of every guide. */
export function GET() {
  const posts = POSTS.map(
    (p) =>
      `---\n\n# ${p.title}\n\nSource: ${SITE_URL}/blog/${p.slug} · Updated ${p.updated ?? p.date}\n\n**Short answer:** ${p.tldr}\n\n${p.body.trim()}\n\n## FAQ\n\n${p.faq.map((f) => `**${f.q}**\n\n${f.a}`).join("\n\n")}`,
  ).join("\n\n");
  return new Response(`${llmsTxt(POSTS, true)}\n${posts}\n`, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}

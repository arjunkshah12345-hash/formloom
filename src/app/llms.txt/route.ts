import { POSTS } from "@/content/blog";
import { llmsTxt } from "@/lib/agent-facts";

export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(POSTS), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}

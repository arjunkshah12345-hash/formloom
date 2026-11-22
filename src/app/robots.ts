import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const PRIVATE = ["/forms", "/account", "/preview", "/welcome", "/api/"];
const PUBLIC_API = ["/api/mcp", "/api/v1/templates"];
// Search and AI crawlers are welcome on everything public: we want to be found and cited.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "meta-externalagent", "DuckAssistBot", "MistralAI-User", "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", ...PUBLIC_API], disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ["/", ...PUBLIC_API], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import type { MetadataRoute } from "next";
import { POSTS } from "@/content/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = POSTS.reduce((d, p) => ((p.updated ?? p.date) > d ? (p.updated ?? p.date) : d), "2026-11-22");
  return [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...POSTS.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated ?? p.date, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${SITE_URL}/docs/agents`, lastModified: latest, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/signup`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}

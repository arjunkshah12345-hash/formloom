import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell } from "@/components/blog/BlogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { POSTS, readingMinutes } from "@/content/blog";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog: Typeform alternatives, form builder guides and pricing",
  description:
    "Honest comparisons of Typeform alternatives, form builder pricing and guides to self-hosting and AI-agent forms, from the team behind Formloom.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", url: "/blog", title: "The Formloom blog" },
};

const date = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default function BlogIndex() {
  const [lead, ...rest] = POSTS;
  return (
    <BlogShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "The Formloom blog",
          url: `${SITE_URL}/blog`,
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.date,
          })),
        }}
      />
      <main className="mx-auto max-w-[1120px] px-5 pt-16 pb-24">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Blog</p>
        <h1 className="mt-4 max-w-[18ch] font-heading text-[clamp(2.4rem,6vw,4rem)] leading-[1] font-medium tracking-[-0.04em]">
          Forms, without the subscription tax.
        </h1>
        <p className="mt-5 max-w-[56ch] text-lg text-ink-2">
          Straight comparisons of form builders, what they really cost, and how to run your own.
        </p>

        {lead ? (
          <Link
            href={`/blog/${lead.slug}`}
            className="group mt-14 block rounded-3xl border border-line p-8 transition hover:border-line-2 sm:p-10"
          >
            <p className="font-tech text-[11px] tracking-wide text-ink-3 uppercase">
              {date(lead.updated ?? lead.date)} · {readingMinutes(lead)} min read
            </p>
            <h2 className="mt-4 max-w-[24ch] font-heading text-3xl font-medium tracking-tight group-hover:text-accent sm:text-4xl">
              {lead.title}
            </h2>
            <p className="mt-4 max-w-[70ch] text-ink-2">{lead.tldr}</p>
          </Link>
        ) : null}

        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-line p-7 transition hover:border-line-2"
              >
                <p className="font-tech text-[11px] tracking-wide text-ink-3 uppercase">
                  {readingMinutes(p)} min read
                </p>
                <h2 className="mt-3 font-heading text-xl font-medium tracking-tight group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </BlogShell>
  );
}

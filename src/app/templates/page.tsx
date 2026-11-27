import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell } from "@/components/blog/BlogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { TEMPLATE_PAGES } from "@/content/template-pages";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const TITLE = "Free form templates: NPS, RSVP, contact, waitlist and more";
const DESCRIPTION =
  "Free Typeform-style form and survey templates you can try live and copy in one click: NPS, customer satisfaction, event RSVP, lead generation, job application, contact, waitlist and quiz.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · Formloom` },
  description: DESCRIPTION,
  alternates: { canonical: "/templates" },
  openGraph: { type: "website", url: "/templates", title: TITLE, description: DESCRIPTION },
};

export default function TemplatesIndex() {
  return (
    <BlogShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          url: `${SITE_URL}/templates`,
          hasPart: TEMPLATE_PAGES.map((t) => ({ "@type": "WebPage", name: t.h1, url: `${SITE_URL}/templates/${t.slug}` })),
        }}
      />
      <main className="mx-auto max-w-[1120px] px-5 pt-16 pb-24">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Templates</p>
        <h1 className="mt-4 max-w-[20ch] font-heading text-[clamp(2.4rem,6vw,4rem)] leading-[1] font-medium tracking-[-0.04em]">
          Free form templates, ready in one click.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg text-ink-2">
          Try each one live on its page, then copy it into a free account: 1,000 responses a month, logic, themes and
          webhooks included. No credit card.
        </p>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_PAGES.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/templates/${t.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-line p-6 transition hover:border-line-2"
              >
                <h2 className="font-heading text-xl font-medium tracking-tight group-hover:text-accent">{t.h1}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{t.description}</p>
                <span className="mt-auto pt-5 font-tech text-[11px] tracking-wide text-ink-3 uppercase">Try it live →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </BlogShell>
  );
}

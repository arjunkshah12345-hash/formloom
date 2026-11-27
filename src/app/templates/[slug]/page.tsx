import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogShell } from "@/components/blog/BlogShell";
import { ThemedDemo } from "@/components/landing/ThemedDemo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getTemplatePage, TEMPLATE_PAGES } from "@/content/template-pages";
import { SITE_URL } from "@/lib/site";
import { templatePreview } from "@/lib/template-preview";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMPLATE_PAGES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const t = getTemplatePage((await params).slug);
  if (!t) return {};
  const path = `/templates/${t.slug}`;
  return {
    title: { absolute: `${t.title} · Formloom` },
    description: t.description,
    keywords: t.keywords,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: t.title, description: t.description, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: t.title, description: t.description },
  };
}

export default async function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  const t = getTemplatePage((await params).slug);
  const def = t && templatePreview(t.template);
  if (!t || !def) notFound();
  const useHref = `/use-template?key=${t.template}`;
  const others = TEMPLATE_PAGES.filter((x) => x.slug !== t.slug).slice(0, 4);
  const url = `${SITE_URL}/templates/${t.slug}`;

  return (
    <BlogShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: t.title,
            description: t.description,
            url,
            isPartOf: { "@type": "WebSite", name: "Formloom", url: SITE_URL },
            about: { "@type": "SoftwareApplication", name: "Formloom", applicationCategory: "BusinessApplication", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Templates", item: `${SITE_URL}/templates` },
              { "@type": "ListItem", position: 2, name: t.h1, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      <main className="mx-auto max-w-[1120px] px-5 pt-14 pb-24">
        <nav aria-label="Breadcrumb" className="font-tech text-[11px] tracking-wide text-ink-3 uppercase">
          <Link href="/templates" className="hover:text-ink">Templates</Link> / {t.h1.replace(/^Free /, "")}
        </nav>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div>
            <h1 className="font-heading text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.04em]">{t.h1}</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-2">{t.answer}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={useHref} className="inline-flex h-12 items-center rounded-full bg-accent px-7 font-medium text-white transition hover:brightness-110">
                Use this template free
              </a>
              <span className="text-sm text-ink-3">No credit card · 1,000 responses/month free</span>
            </div>
            <h2 className="mt-12 font-heading text-xl font-medium tracking-tight">What&rsquo;s inside</h2>
            <ul className="mt-4 space-y-2 text-ink-2">
              {t.inside.map((x) => (
                <li key={x} className="flex gap-3"><span className="text-accent">→</span>{x}</li>
              ))}
            </ul>
            <h2 className="mt-10 font-heading text-xl font-medium tracking-tight">Use it for</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {t.uses.map((x) => (
                <li key={x} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-2">{x}</li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line lg:sticky lg:top-20">
            <ThemedDemo definition={def} />
          </div>
        </div>

        <section className="mt-20 max-w-[820px]" aria-labelledby="how">
          <h2 id="how" className="font-heading text-2xl font-medium tracking-tight">How to use this template</h2>
          <ol className="mt-5 list-decimal space-y-2 pl-6 text-ink-2">
            <li>Click <strong className="text-ink">Use this template free</strong> and create an account (email or Google).</li>
            <li>Edit the questions, logic and theme in the builder. Changes save automatically.</li>
            <li>Press Publish, then share the link, a QR code, or embed it on your site with one line of code.</li>
            <li>Watch responses arrive in Results, export CSV, or send each one to your tools by webhook.</li>
          </ol>
        </section>

        <section className="mt-16 max-w-[820px]" aria-labelledby="faq">
          <h2 id="faq" className="font-heading text-2xl font-medium tracking-tight">Frequently asked questions</h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {t.faq.map((f) => (
              <div key={f.q} className="py-5">
                <dt><h3 className="font-medium text-ink">{f.q}</h3></dt>
                <dd className="mt-2 leading-relaxed text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="mt-16 rounded-3xl border border-accent/40 bg-accent/[0.07] p-8">
          <p className="font-heading text-2xl font-medium tracking-tight">Typeform-style forms, without the Typeform bill</p>
          <p className="mt-2 max-w-[62ch] text-ink-2">
            Typeform&rsquo;s free plan stops at 10 responses a month. Formloom gives you 1,000 free, Pro is $6 a month for
            unlimited, and it&rsquo;s open source.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={useHref} className="inline-flex h-11 items-center rounded-full bg-accent px-6 font-medium text-white transition hover:brightness-110">
              Use this template free
            </a>
            <Link href="/typeform-alternative" className="inline-flex h-11 items-center rounded-full border border-line-2 px-6 transition hover:border-ink-3">
              Compare with Typeform
            </Link>
          </div>
        </aside>

        <section className="mt-16" aria-labelledby="more">
          <h2 id="more" className="font-heading text-xl font-medium tracking-tight">More free templates</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/templates/${o.slug}`} className="block rounded-2xl border border-line p-5 transition hover:border-line-2 hover:text-accent">
                  {o.h1}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </BlogShell>
  );
}

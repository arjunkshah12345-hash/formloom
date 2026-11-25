import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCta, BlogShell } from "@/components/blog/BlogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPost, POSTS, readingMinutes } from "@/content/blog";
import { headings, Markdown } from "@/lib/markdown";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}`, types: { "text/markdown": `/blog/${post.slug}.md` } },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const date = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = `${SITE_URL}/blog/${post.slug}`;
  const toc = headings(post.body);
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <BlogShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated ?? post.date,
            url,
            mainEntityOfPage: url,
            keywords: post.keywords.join(", "),
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
            image: `${SITE_URL}/opengraph-image`,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Formloom", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
          ...(post.faq.length
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: post.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                },
              ]
            : []),
        ]}
      />
      <main className="mx-auto grid max-w-[1120px] gap-12 px-5 pt-14 pb-24 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0 max-w-[720px]">
          <nav className="font-tech text-[11px] tracking-wide text-ink-3 uppercase" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-ink">Blog</Link> <span aria-hidden>/</span>{" "}
            {date(post.updated ?? post.date)} · {readingMinutes(post)} min read
          </nav>
          <h1 className="mt-5 font-heading text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] font-medium tracking-[-0.04em]">
            {post.title}
          </h1>
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <p className="font-tech text-[10px] tracking-[0.16em] text-accent uppercase">Short answer</p>
            <p className="mt-2 text-[17px] leading-relaxed text-ink">{post.tldr}</p>
          </div>
          <div className="prose-blog mt-10">
            <Markdown source={post.body} />
          </div>

          {post.faq.length ? (
            <section className="mt-16" aria-labelledby="faq">
              <h2 id="faq" className="font-heading text-2xl font-medium tracking-tight">
                Frequently asked questions
              </h2>
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {post.faq.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt><h3 className="font-medium text-ink">{f.q}</h3></dt>
                    <dd className="mt-2 leading-relaxed text-ink-2">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <BlogCta />

          <section className="mt-16">
            <h2 className="font-tech text-[11px] tracking-[0.16em] text-ink-3 uppercase">Keep reading</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="block h-full rounded-2xl border border-line p-5 text-[15px] transition hover:border-line-2 hover:text-accent">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>

        {toc.length > 2 ? (
          <aside className="max-lg:hidden">
            <div className="sticky top-24">
              <p className="font-tech text-[10px] tracking-[0.16em] text-ink-3 uppercase">On this page</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-ink-3 transition hover:text-ink">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </main>
    </BlogShell>
  );
}

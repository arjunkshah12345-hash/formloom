import type { Metadata } from "next";
import Link from "next/link";
import { BlogCta, BlogShell } from "@/components/blog/BlogShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Markdown } from "@/lib/markdown";
import { launchActive, launchEndsLabel } from "@/lib/plans";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { REPO_URL } from "@/lib/url";

const TITLE = "Free Typeform alternative: open source, 1,000 responses free";
const DESCRIPTION =
  "Formloom is a free Typeform alternative: the same one-question-at-a-time forms, 1,000 responses a month free (Typeform gives 10), Pro at $6/month, or self-host it free. MIT licensed.";
const PATH = "/typeform-alternative";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "typeform alternative",
    "free typeform alternative",
    "typeform alternatives",
    "typeform alternative free",
    "open source typeform alternative",
    "cheap typeform alternative",
    "typeform free alternative",
    "self-hosted typeform",
  ],
  alternates: { canonical: PATH },
  openGraph: { type: "website", url: PATH, title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const FAQ = [
  {
    q: "Is there a free alternative to Typeform?",
    a: "Yes. Formloom's hosted free plan includes 1,000 responses a month with every feature, including logic jumps, themes, webhooks and the API. Typeform's free plan allows 10 responses a month. If you self-host Formloom, it is free with no limits at all.",
  },
  {
    q: "Does Formloom look and work like Typeform?",
    a: "Yes. Forms show one question at a time, full screen, with keyboard shortcuts (Enter to continue, letter keys for choices), logic jumps, answer recall, welcome and ending screens, and custom themes and fonts.",
  },
  {
    q: "How much does Formloom cost compared with Typeform?",
    a: "Formloom Pro is $6/month billed yearly ($8 month to month, or $99 once for lifetime) with unlimited responses and no seat pricing. Typeform Basic is $28/month billed yearly for 100 responses a month, and removing Typeform branding starts on Plus at $56/month billed yearly.",
  },
  {
    q: "Is Formloom open source?",
    a: "Yes, under the MIT license. The full source is on GitHub and you can run it with Docker, Node.js or Cloudflare Workers. Responses stay on your own server.",
  },
  {
    q: "What happens if I go over 1,000 responses on the free plan?",
    a: "Your form keeps working and every response is saved. The extra responses are held and appear when you upgrade.",
  },
  {
    q: "What does Typeform have that Formloom doesn't?",
    a: "Native integrations with tools like Salesforce and HubSpot, payment fields, file uploads, video questions and team workspaces. Formloom connects to other tools through signed webhooks and a REST API instead.",
  },
];

const BODY = `
## Formloom vs Typeform at a glance

| | Formloom | Typeform |
| --- | --- | --- |
| Free plan | **1,000 responses/month**, every feature | 10 responses/month |
| Cheapest paid plan | **$6/month** billed yearly, unlimited responses | $28/month billed yearly, 100 responses/month |
| Remove branding | Pro ($6/month) | Plus ($56/month billed yearly) |
| Pay once | **$99 lifetime** | No |
| Seats | No seat pricing | A fixed number of seats per plan |
| One question at a time | Yes | Yes |
| Logic jumps and answer recall | Yes, on every plan | Yes |
| Webhooks and API | Yes, on every plan | Yes |
| Self-host | **Yes, free (Docker, Node, Cloudflare)** | No |
| Open source | **Yes, MIT** | No |

Typeform prices are from [typeform.com/pricing](https://www.typeform.com/pricing), checked November 2026. Full breakdown in [Typeform pricing explained](/blog/typeform-pricing).

## Why people switch from Typeform

Typeform makes good-looking forms, and people finish them. The problem is the meter. Ten responses a month on the free plan is a test, not a plan. A form that goes even slightly viral uses up the $28 plan in a day.

Formloom keeps the part people like (the full-screen, one-question-at-a-time flow) and drops the meter:

- **1,000 responses a month free**, with logic, themes, webhooks and the API included. No feature is held back for paid plans.
- **Pro is $6 a month** for unlimited responses and no badge. There are no tiers or seats, and it costs the same when your team grows.
- **Self-host it for free.** It's one Next.js app with one SQLite file, and nothing is metered.

## Everything you need from a Typeform alternative

- **16 question types:** short and long text, email, phone, website, number, multiple choice, picture choice, dropdown, yes/no, legal, rating, opinion scale, NPS, date and statement.
- **Logic jumps** with and/or rules on any earlier answer, and multiple endings.
- **Answer recall and hidden fields**, for example \`?source=newsletter\`.
- **9 theme presets, 12 Google Fonts**, custom colors and background images.
- **Results** with completion rate, average time, drop-off by question, NPS breakdown and CSV export.
- **Signed webhooks, a REST API and embeds** (inline or popup).
- **Built for AI coding agents:** copy a setup prompt into Claude Code, Cursor or Codex, or connect the [MCP server](/docs/agents).

## Move from Typeform in about five minutes

1. [Create a free account](/signup). No credit card.
2. Start from a template, or rebuild your form question by question. Logic and themes work the same way.
3. Publish and share the link, or embed it on your site.
4. Point your old webhook or automation at Formloom's signed webhook.

## Other Typeform alternatives

Formloom isn't the only option. If you need native CRM integrations, Fillout or Jotform may suit you better. If you want the biggest free plan, look at Tally. We compare all of them honestly in [the best Typeform alternatives in 2026](/blog/best-typeform-alternatives). See also the [open-source Typeform alternative](/blog/open-source-typeform-alternative) guide and [Formloom vs Typeform](/blog/formloom-vs-typeform).
`;

export default function TypeformAlternativePage() {
  const url = `${SITE_URL}${PATH}`;
  const launch = launchActive();
  return (
    <BlogShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: TITLE,
            description: DESCRIPTION,
            url,
            about: { "@type": "SoftwareApplication", name: SITE_NAME, url: SITE_URL, applicationCategory: "BusinessApplication" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Formloom", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Typeform alternative", item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      <main className="mx-auto max-w-[820px] px-5 pt-16 pb-24">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Free Typeform alternative</p>
        <h1 className="mt-5 font-heading text-[clamp(2.4rem,6vw,4rem)] leading-[1.0] font-medium tracking-[-0.045em]">
          Typeform-style forms, without the $28/month meter.
        </h1>
        <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink-2">
          Formloom is a free, open-source Typeform alternative. The same one-question-at-a-time forms, with{" "}
          <strong className="text-ink">1,000 responses a month free</strong> (Typeform gives you 10), Pro at $6 a month,
          or self-host it for free.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/signup" className="inline-flex h-12 items-center rounded-full bg-accent px-7 font-medium text-white transition hover:brightness-110">
            Build a form free
          </Link>
          <a href={REPO_URL} className="inline-flex h-12 items-center rounded-full border border-line-2 px-6 transition hover:border-ink-3">
            View the source ↗
          </a>
          <span className="text-sm text-ink-3">No credit card · MIT licensed</span>
        </div>
        {launch ? (
          <p className="mt-6 inline-block rounded-full border border-accent/40 bg-accent/[0.08] px-4 py-2 text-sm text-ink-2">
            Launch offer: half off your first Pro payment until {launchEndsLabel()}, applied at checkout.
          </p>
        ) : null}

        <div className="prose-blog mt-14">
          <Markdown source={BODY} />
        </div>

        <section className="mt-16" aria-labelledby="faq">
          <h2 id="faq" className="font-heading text-2xl font-medium tracking-tight">
            Frequently asked questions
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-medium text-ink">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-ink-2">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <BlogCta />
      </main>
    </BlogShell>
  );
}

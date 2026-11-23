import type { Post } from "./types";

const post: Post = {
  slug: "typeform-pricing",
  title: "Typeform pricing in 2026, explained (and what it costs to switch)",
  description:
    "Typeform pricing in 2026: every plan, response limit and seat count, what happens when you hit the cap, and what it costs to switch to a cheaper alternative.",
  date: "2026-11-22",
  keywords: [
    "typeform pricing",
    "typeform cost",
    "typeform plans",
    "typeform free plan",
    "typeform response limit",
    "is typeform free",
    "typeform alternative",
  ],
  tldr:
    "Typeform's free plan allows 10 responses a month. Paid plans billed yearly are Basic $28/month (100 responses), Plus $56/month (1,000 responses, branding removal), and Business $91/month (10,000 responses); monthly billing costs $39, $79 and $129. When you hit the cap your forms go private until the month resets or you pay for more.",
  faq: [
    {
      q: "Is Typeform free?",
      a: "Typeform has a free plan with unlimited forms but only 10 responses a month across all forms, and Typeform branding cannot be removed on it.",
    },
    {
      q: "How much does Typeform cost per month?",
      a: "Basic is $28/month billed yearly or $39 monthly, Plus is $56 or $79, and Business is $91 or $129. Talent and Growth plans cost more, and Enterprise is custom.",
    },
    {
      q: "What happens when I reach my Typeform response limit?",
      a: "Typeform emails you at 90% and 100%. At 100%, your forms switch to private mode until the next month or until you upgrade, buy a response add-on or turn on auto-upgrade.",
    },
    {
      q: "Which Typeform plan removes the branding?",
      a: "Branding removal starts on the Plus plan, $56/month billed yearly or $79 monthly.",
    },
    {
      q: "What is a cheaper alternative to Typeform?",
      a: "Formloom offers the same one-question-at-a-time forms with 1,000 free responses a month, and unlimited responses for $6/month billed yearly. Self-hosted, it is free.",
    },
  ],
  body: `
**Typeform costs $0 for 10 responses a month, then $28 to $91 a month billed yearly ($39 to $129 billed monthly) on its main plans.** Each plan has a monthly response cap and a fixed number of seats, and removing the Typeform branding starts on the Plus plan. Here's what each plan includes, what happens at the limit, and what it costs to switch.

All figures come from Typeform's pricing page and help center in November 2026. Links are at the end.

## Typeform plans at a glance

| Plan | Billed yearly | Billed monthly | Responses/month | Seats | Notable features |
| --- | --- | --- | --- | --- | --- |
| Free | $0 | $0 | 10 | 1 | Unlimited forms, logic, embeds, integrations; Typeform branding |
| Basic | $28/mo ($336/yr) | $39/mo | 100 | 1 | AI form creation, logic, webhooks and integrations |
| Plus | $56/mo | $79/mo | 1,000 | 3 | Branding removal, custom subdomain |
| Business | $91/mo | $129/mo | 10,000 | 5 | Drop-off rates, conversion tracking, priority support |
| Talent | $119/mo | $169/mo | 3,000 | 3 | Video Q&A, reCAPTCHA, multi-language |
| Growth Flow | $266/mo | $379/mo | 10,000 | 5 | Lead enrichment, Salesforce, email and SMS follow-ups |
| Enterprise | Custom | Custom | Custom | 6+ | SSO, data center choice, dedicated support |

## How Typeform's response limits work

Every plan, including the free one, has a **monthly response allowance shared across all your forms**. It's not per form. A few details matter:

- **Unused responses don't roll over.** A quiet month doesn't bank anything for a busy one.
- **Deleting responses doesn't give them back.** Once a response is counted, it stays counted.
- **You get emails at 90% and 100%.**
- **At 100%, your forms switch to private mode** until the next month starts or you upgrade. Anyone opening the form can't submit.
- **You can buy more** with a response add-on or by turning on auto-upgrade, up to a ceiling per plan (750 on Basic, 2,500 on Plus, 50,000 on Business).

The private-mode behavior is the part that bites. A form that goes viral, a launch day or a busy event can hit the cap in hours, and the people you most want to hear from get turned away.

## The real cost of the cheapest useful plan

Basic at $28/month gives you 100 responses. That's about three a day. Most people who need forms for leads, applications or feedback outgrow it fast. The plan most teams end up on is Plus, because it lifts the cap to 1,000 and is the first plan that removes the Typeform branding:

- **Plus, billed yearly:** $56 × 12 = **$672/year**.
- **Plus, billed monthly:** $79 × 12 = **$948/year**.
- **Business, billed yearly:** $91 × 12 = **$1,092/year**.

Seats are fixed by plan, so adding a fourth teammate on Plus means moving to Business.

## What Typeform is good value for

Fair is fair: Typeform's price buys real things. It has the most polished respondent experience, a large catalog of native integrations (including Salesforce and HubSpot), AI form creation, video questions and multi-language forms on higher plans, and enterprise options like SSO. If you need those, the price can be worth it.

If what you mainly want is the one-question-at-a-time form, with logic, recall, themes, webhooks and analytics, you're paying a lot for features you won't use.

## What it costs to switch

Here's what the same need (1,000 responses a month, no vendor branding) costs elsewhere, using each vendor's cheapest plan that covers it:

| Option | Yearly cost for 1,000 responses/month with no vendor badge |
| --- | --- |
| Typeform Plus (billed yearly) | $672 |
| Formloom Pro (billed yearly) | $72 |
| Formloom Lifetime | $99 once |
| Self-hosted Formloom | $0 plus your server |

Formloom Pro also has no response cap at all, so the same $72 covers 10,000 or 100,000 responses. For other tools, see [the best Typeform alternatives](/blog/best-typeform-alternatives): Tally, Youform and Fillout all have free plans that are more generous than Typeform's, with paid plans from about $15 to $29 a month.

### Switching time

There's no automatic Typeform importer in Formloom. Most forms take 5 to 15 minutes to rebuild:

1. Create a form, or start from a template (NPS feedback, event registration, lead generation, job application, product research or a quiz).
2. Add your questions. Formloom has 16 question types covering everything except Typeform's file upload, payment and video questions.
3. Recreate your logic jumps and recall.
4. Pick a theme and font to match your brand.
5. Replace the Typeform link or embed with the Formloom one.
6. Point your integration at Formloom's signed webhook or REST API.

Export your old responses from Typeform as CSV before you cancel.

## Bottom line

Typeform's pricing makes sense for teams that use its integrations and advanced features. For everyone else, the response caps and the price of branding removal are hard to justify. See the full [Formloom vs Typeform comparison](/blog/formloom-vs-typeform), [start free](/signup) with 1,000 responses a month, or check [Formloom pricing](/#pricing). At launch, \`LAUNCH50\` takes half off your first Pro payment.

## Sources

- [Typeform pricing](https://www.typeform.com/pricing)
- [Typeform Help Center: free plan](https://help.typeform.com/hc/en-us/articles/360032972852)
- [Tally pricing](https://tally.so/pricing)
- [Fillout pricing](https://www.fillout.com/pricing)
- [Youform pricing](https://youform.com/pricing)

Prices checked November 2026. Typeform changes its plans from time to time, so confirm on its pricing page before you buy.
`,
};

export default post;

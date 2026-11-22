import type { Post } from "./types";

const post: Post = {
  slug: "formloom-vs-typeform",
  title: "Formloom vs Typeform: features, pricing and limits",
  description:
    "Formloom vs Typeform compared: pricing, response limits, branding, logic, integrations and self-hosting. An honest look at where each one wins.",
  date: "2026-11-22",
  keywords: [
    "formloom vs typeform",
    "typeform alternative",
    "typeform vs",
    "typeform response limit",
    "cheaper typeform",
    "open source typeform",
  ],
  tldr:
    "Formloom gives the same one-question-at-a-time form experience as Typeform for far less: 1,000 free responses a month versus Typeform's 10, and unlimited responses for $6/month billed yearly versus Typeform's $28/month for 100. Typeform still wins on native integrations, payments, video questions, team features and brand recognition.",
  faq: [
    {
      q: "Is Formloom cheaper than Typeform?",
      a: "Yes. Formloom Pro is $6/month billed yearly ($8 monthly, or $99 once) with unlimited responses and no badge. Typeform Basic is $28/month billed yearly for 100 responses a month, and branding removal starts on Plus at $56/month billed yearly.",
    },
    {
      q: "Can I move my Typeform forms to Formloom?",
      a: "There is no one-click Typeform importer. Formloom forms are plain JSON, so you can rebuild a form in the editor, start from one of seven templates, or import a JSON definition.",
    },
    {
      q: "What does Typeform do that Formloom doesn't?",
      a: "Native integrations (Salesforce, HubSpot and many others), payments, file uploads, video questions, multi-language forms, AI features, team seats and enterprise SSO.",
    },
  ],
  body: `
**Formloom and Typeform give respondents the same experience: one question at a time, full screen, keyboard friendly.** The difference is in pricing, limits and ownership. Formloom is open source (MIT), free for 1,000 responses a month on the hosted plan, $6/month for unlimited responses, and free with no limits when you self-host. Typeform costs more and caps responses on every plan, but has a much bigger integration catalog and more advanced features.

## Side-by-side

| | Formloom | Typeform |
| --- | --- | --- |
| Free plan | 1,000 responses/month, every feature | 10 responses/month |
| Cheapest paid plan | $6/mo billed yearly, $8 monthly | Basic: $28/mo billed yearly, $39 monthly |
| Responses on cheapest paid plan | Unlimited | 100/month |
| One-time option | Lifetime, $99 | None |
| Remove branding | Pro or Lifetime (or self-host) | Plus and up ($56/mo billed yearly) |
| Seats | No seat pricing | 1 on Basic, 3 on Plus, 5 on Business |
| Over the limit | Form keeps working; extra responses held until you upgrade | Forms switch to private until reset, upgrade or add-on |
| Self-hosting | Yes (Docker, Node, Cloudflare Workers) | No |
| Source code | MIT licensed | Closed |
| Question types | 16 | More, including file upload, payment and video |
| Logic jumps and recall | Yes | Yes |
| Themes and fonts | 9 presets, 12 fonts, custom colors and images | Yes, plus more advanced brand kits |
| Webhooks | Yes, HMAC-signed, with retries | Yes |
| REST API | Yes | Yes |
| Native integrations | Through webhooks and API | Large catalog incl. Salesforce, HubSpot |
| Analytics | Completion rate, time, per-question drop-off, NPS | Yes; drop-off on Business |
| AI | Agent setup prompt; MCP server being added | AI form creation and insights |

Typeform figures come from its pricing page in November 2026.

## Pricing

This is the main reason people compare the two.

**Typeform** has a free plan with 10 responses a month across all your forms. Paid plans (billed yearly) are Basic at $28/month for 100 responses, Plus at $56/month for 1,000 responses, and Business at $91/month for 10,000. Monthly billing costs more: $39, $79 and $129. Removing the Typeform branding starts on Plus. There are also Talent and Growth plans and custom Enterprise pricing. See [Typeform pricing explained](/blog/typeform-pricing) for the details.

**Formloom** has one paid plan. Pro is $6/month billed yearly ($72/year) or $8 month to month. It adds unlimited responses and lets you remove the "Made with Formloom" badge. Every other feature is in the free plan too. If you don't want a subscription, Lifetime is $99 once. There are no seats, so adding a teammate doesn't change the price. At launch, \`LAUNCH50\` takes half off the first Pro payment.

Rough yearly cost for 1,000 responses a month with no vendor branding:

- **Typeform Plus:** $672/year (billed yearly).
- **Formloom Pro:** $72/year, or $99 once for Lifetime.
- **Self-hosted Formloom:** your server cost.

## Response limits

Typeform counts every response against a monthly allowance. At 100% of it, your forms switch to private mode until the month resets or you upgrade. You can buy add-on responses or turn on auto-upgrade, and deleting responses doesn't give the allowance back.

Formloom's paid plans have no response cap. On the free plan, going over 1,000 in a month never stops your form. Every response is saved; the extra ones are held and hidden from results, exports, the API and webhooks until you upgrade, then they appear. Nobody filling in your form ever sees an error.

## The form experience

Here the two are close. Both do:

- One question per screen with keyboard shortcuts.
- Welcome screens and multiple endings, with redirects.
- Logic jumps based on earlier answers.
- Answer recall in later questions.
- Hidden fields passed in the URL.
- Ratings, opinion scales and NPS.
- Mobile-friendly layouts and embeds.

Formloom's logic supports \`and\`/\`or\` rules on any earlier answer, jumping to a question or to one of several endings. Its 16 question types cover text, email, phone, website, number, multiple choice, picture choice, dropdown, yes/no, legal, rating, opinion scale, NPS, date and statement.

Typeform has more question types, including file upload, payment, video and audio answers (on some plans), and multi-language forms. If you need those, Typeform is the better choice today.

## Design

Both let you set colors, fonts and background images. Formloom ships 9 theme presets and 12 Google Fonts, with options for corner styles, alignment and per-screen images (stacked, split or wallpaper). Typeform has a deeper design system and brand kits for larger teams.

## Integrations and data

Typeform's integration catalog is one of its strongest points: native connections to Salesforce, HubSpot, Google Sheets, Slack and many more, without code.

Formloom takes a developer-first approach:

- **Webhooks** for every submission, signed with HMAC-SHA256 in \`X-Formloom-Signature\`, with retries and a delivery log.
- **A REST API** to list forms and page through responses.
- **CSV export** of everything.
- **A "Copy agent setup prompt" button** you paste into Claude Code, Cursor or Codex to embed a form and build the webhook handler. See [forms with AI coding agents](/blog/ai-agent-forms).

If you're not technical and need data in your CRM without code, Typeform (or an automation tool connected to Formloom's webhook) is easier.

## Ownership and privacy

Typeform is cloud only. Formloom can run on your own server as one Node process with one SQLite file, which matters for internal tools, regulated data or air-gapped networks. Formloom also loads no third-party tracking scripts on forms. Read more in [the open-source Typeform alternative](/blog/open-source-typeform-alternative).

## Which should you pick?

**Pick Typeform if** you need native CRM integrations, payments, file uploads, video questions, multi-language forms, team seats or SSO, and the budget fits.

**Pick Formloom if** you want Typeform's form experience at a flat low price, unlimited responses, the option to self-host, or source code you can read and change.

## Try it

[Create a free Formloom account](/signup) and rebuild one of your Typeforms in a few minutes, or see [pricing](/#pricing). The source is on [GitHub](https://github.com/arjunkshah12345-hash/formloom).

## Sources

- [Typeform pricing](https://www.typeform.com/pricing)
- [Typeform Help Center: free plan](https://help.typeform.com/hc/en-us/articles/360032972852)
`,
};

export default post;

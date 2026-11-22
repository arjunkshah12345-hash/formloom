import { dollars, LIFETIME_PRICE, PLAN_FEATURES, PRO_PRICE } from "@/lib/plans";
import type { CodeTab } from "./CodeTabs";

export const CODE: CodeTab[] = [
  {
    key: "webhook",
    label: "Webhook",
    file: "POST https://your-app.com/hooks/formloom",
    code: `// x-formloom-signature: sha256=8f1c…  (HMAC of the raw body)
{
  "event": "form_response",
  "form": { "id": "frm_8Kq2", "title": "Customer feedback" },
  "response": {
    "id": "rsp_x91a",
    "submittedAt": "2026-11-19T09:24:11.000Z",
    "durationMs": 41250,
    "hidden": { "product": "Acme" },
    "answers": [
      { "fieldId": "f_nps", "type": "nps", "value": 9, "text": "9" },
      { "fieldId": "f_why", "type": "long_text",
        "value": "Setup took two minutes.", "text": "Setup took two minutes." }
    ]
  }
}`,
  },
  {
    key: "api",
    label: "REST API",
    file: "terminal",
    code: `# List your forms
curl https://forms.example.com/api/v1/forms \\
  -H "Authorization: Bearer fl_your_api_key"

# Page through responses
curl "https://forms.example.com/api/v1/forms/frm_8Kq2/responses?limit=50" \\
  -H "Authorization: Bearer fl_your_api_key"`,
  },
  {
    key: "embed",
    label: "Embed",
    file: "index.html",
    code: `<!-- Inline -->
<iframe src="https://forms.example.com/f/feedback?embed=1"
        style="width:100%;height:600px;border:0"></iframe>

<!-- Popup on click -->
<button data-formloom-popup="https://forms.example.com/f/feedback?embed=1">
  Give feedback
</button>
<script src="https://forms.example.com/embed.js" async></script>`,
  },
  {
    key: "verify",
    label: "Verify signature",
    file: "verify.ts",
    code: `import crypto from "node:crypto";

export function isFromFormloom(rawBody: string, header: string, secret: string) {
  const expected = "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
}`,
  },
];

export const COMPARE: [string, string | boolean, string | boolean][] = [
  ["Price", "Free, or $6/mo for Pro ($99 for life)", "From ~$28/mo"],
  ["Free responses per month", "1,000 (unlimited self-hosted)", "Capped low"],
  ["Paid responses per month", "Unlimited", "Capped by plan"],
  ["Over the limit", "Form keeps working", "Form stops"],
  ["Where data lives", "Your server", "Their cloud"],
  ["Logic jumps & recall", true, true],
  ["Custom themes & fonts", true, true],
  ["Webhooks & API", true, "Higher tiers"],
  ["Remove branding", "Pro, or free self-hosted", "Paid plans"],
  ["Read & change the source", true, false],
  ["Works offline / air-gapped", true, false],
];

export const FAQ = [
  {
    q: "Is Formloom really free?",
    a: "Yes. The hosted version is free for up to 1,000 responses a month with every question type, logic, theme, webhook and the API. Self-hosted Formloom is MIT licensed with no limits at all: run it on your own machine, a $5 VPS or inside your company network.",
  },
  {
    q: "What does Pro add, and what happens if I go over?",
    a: "Pro is $6 a month billed yearly, or $8 month to month: unlimited responses and no \u201cMade with Formloom\u201d badge. One flat price, no seats or tiers. Rather not subscribe? Lifetime is $99, paid once. If a free account goes past 1,000 responses in a month, the form keeps working and every response is saved. The extra ones wait for you and appear as soon as you upgrade.",
  },
  {
    q: "What do I need to host it?",
    a: "Node 22.13+ or Docker. Formloom is a single Next.js process with an embedded SQLite database, so there's no Postgres, Redis or queue to run. Back up one file and you've backed up everything.",
  },
  {
    q: "Can I move my existing forms over?",
    a: "Forms are plain JSON. You can export and import them from the dashboard, or create them through the API. Start from one of seven templates if you'd rather not start blank.",
  },
  {
    q: "How do I get responses into my other tools?",
    a: "Every submission can fire a signed webhook (with retries and a delivery log), you can pull data with the REST API, or download CSV and JSON at any time.",
  },
  {
    q: "Does it work on phones and inside my site?",
    a: "The form player is responsive and touch friendly. Share a link or QR code, embed it inline with an iframe, or open it as a popup with a one-line script.",
  },
  {
    q: "Do you track my respondents?",
    a: "No third-party scripts and no telemetry. Formloom counts views, starts and drop-off for your own analytics using an anonymous ID kept on your server.",
  },
];

/** Self-hosted, Cloud Free and Cloud Pro. Prices mirror src/lib/plans.ts. */
export const PRICING: {
  name: string;
  price: string;
  per: string;
  note: string;
  features: readonly string[];
  cta: string;
  /** "cta" = sign up or dashboard, "pro" = upgrade, otherwise a link. */
  href: string;
  featured?: boolean;
  tag?: string;
}[] = [
  {
    name: "Cloud · Free",
    price: "$0",
    per: "",
    note: "Everything you need to run real forms, hosted for you.",
    features: PLAN_FEATURES.free,
    cta: "Start free",
    href: "cta",
  },
  {
    name: "Cloud · Pro",
    price: dollars(PRO_PRICE.year / 12),
    per: "/month",
    note: `Billed yearly, or ${dollars(PRO_PRICE.month)} month to month, or ${dollars(LIFETIME_PRICE)} once for life. No seats.`,
    features: PLAN_FEATURES.pro,
    cta: "Go Pro",
    href: "pro",
    featured: true,
    tag: "Best value",
  },
  {
    name: "Self-hosted",
    price: "$0",
    per: "forever",
    note: "MIT licensed. Your server, your database, every feature.",
    features: [
      "Unlimited responses",
      "No badge unless you want one",
      "Docker, Node or Cloudflare Workers",
      "One SQLite file to back up",
      "Read and change every line",
    ],
    cta: "Get the source ↗",
    href: "https://github.com/arjunkshah12345-hash/formloom",
  },
];

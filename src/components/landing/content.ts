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
  ["Price", "Free, forever", "Monthly plans"],
  ["Responses per month", "Unlimited", "Capped by plan"],
  ["Where data lives", "Your server", "Their cloud"],
  ["Logic jumps & recall", true, true],
  ["Custom themes & fonts", true, true],
  ["Webhooks & API", true, "Higher tiers"],
  ["Remove branding", true, "Higher tiers"],
  ["Read & change the source", true, false],
  ["Works offline / air-gapped", true, false],
];

export const FAQ = [
  {
    q: "Is Formloom really free?",
    a: "Yes. It's MIT licensed. Run it on your own machine, a $5 VPS or inside your company network. There are no paid tiers and no response limits.",
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

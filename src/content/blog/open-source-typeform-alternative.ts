import type { Post } from "./types";

const post: Post = {
  slug: "open-source-typeform-alternative",
  title: "Open-source Typeform alternative you can self-host",
  description:
    "Formloom is an open-source Typeform alternative under the MIT license. Self-host it free with Docker, Node or Cloudflare, or use the hosted free plan.",
  date: "2026-11-22",
  keywords: [
    "open source typeform",
    "open source typeform alternative",
    "free typeform alternative",
    "self-hosted typeform",
    "typeform clone",
    "mit license form builder",
  ],
  tldr:
    "Formloom is an open-source (MIT) Typeform alternative: one-question-at-a-time forms with logic jumps, answer recall, 16 question types, themes, webhooks and a REST API. Self-hosted it is free and unlimited and runs as one Node process with one SQLite file; the hosted version is free for 1,000 responses a month.",
  faq: [
    {
      q: "Is there an open-source version of Typeform?",
      a: "Formloom is an open-source, MIT-licensed form builder with the same one-question-at-a-time experience as Typeform. You can read, change and self-host all of the code.",
    },
    {
      q: "Is self-hosted Formloom really unlimited?",
      a: "Yes. Self-hosted Formloom has no plans and no metering. Every feature is on, with unlimited forms and responses, and no badge unless you want one.",
    },
    {
      q: "What do I need to run it?",
      a: "Node 22.13 or newer, or Docker. Formloom is a single Next.js process with an embedded SQLite database, so there is no Postgres, Redis or queue to run. It can also be deployed to Cloudflare Workers with D1.",
    },
    {
      q: "Can I use it commercially?",
      a: "Yes. The MIT license allows commercial use, modification and redistribution, as long as you keep the license notice.",
    },
  ],
  body: `
**Formloom** is a free, open-source Typeform alternative. It's MIT licensed, it gives respondents the same full-screen, one-question-at-a-time flow, and you can run it on your own server with one command. If you'd rather not host anything, the hosted version is free for 1,000 responses a month.

The code is on [GitHub](https://github.com/arjunkshah12345-hash/formloom).

## Why an open-source form builder

Forms collect some of the most sensitive data a business has: names, emails, phone numbers, feedback, job applications. With a hosted, closed-source tool, that data sits in someone else's cloud, under their pricing, and the form stops when you hit their response cap.

Open source changes three things:

1. **You can own the data.** Run Formloom on your own machine and every response lives in a SQLite file you control.
2. **You can't be priced out.** Self-hosted, nothing is metered. There's no response cap to hit in the middle of a launch.
3. **You can read and change the code.** Add a question type, change the email flow, audit how answers are validated.

## What Formloom does

Formloom isn't a toy clone. It covers what most people use Typeform for.

### The respondent experience

- Full-screen, one question at a time, with smooth transitions that follow the direction you're moving.
- Keyboard first: \`Enter\` to continue, \`A\` to \`Z\` to pick choices, \`Y\`/\`N\` for yes/no, number keys for ratings and scales.
- Progress bar, back and forward navigation, and inline validation.
- Works on phones and embeds anywhere.

### 16 question types

Short text, long text, email, phone, website, number, multiple choice (single or multi, with "Other", randomized order and min/max picks), picture choice, searchable dropdown, yes/no, legal, rating (stars, hearts or circles), opinion scale, Net Promoter Score, date and statement.

### The builder

- A three-pane editor with a live preview in your theme, on desktop and mobile.
- Drag and drop for questions and choices.
- **Logic jumps** with \`and\`/\`or\` rules on any earlier answer. Jump to a question or to one of several endings.
- **Answer recall**: use an earlier answer later in the form, like "Thanks, Sam".
- **Hidden fields** from the URL, such as \`?source=newsletter\`.
- **Themes**: 9 presets, 12 Google Fonts, custom colors, background images, corner styles and alignment.
- Autosave, undo and redo, drafts versus published versions, and JSON import and export.
- 7 starter templates: blank, customer feedback (NPS), event registration, lead generation, job application, product research and a personality quiz.

### Results and integrations

- Views, starts, submissions, completion rate and average completion time.
- A drop-off funnel for every question, and charts for every answer.
- A responses table with search, date ranges, bulk delete and CSV export.
- Webhooks signed with HMAC-SHA256 (\`X-Formloom-Signature\`), with retries and a delivery log.
- A REST API with API keys.
- Inline and popup embeds through \`/embed.js\`, plus links and QR codes.

## How it's built

The whole thing is one Next.js app and one SQLite database (it uses Node's built-in \`node:sqlite\`). There's no Postgres, Redis or job queue to run. Uploaded images sit next to the database in one data folder, so backing up that folder backs up everything.

The form engine (validation, branching and recall) runs both in the browser and on the server. Submissions are checked again on the server and pruned to the path the respondent actually took, so a crafted request can't slip in answers to questions that were skipped.

Formloom also doesn't load third-party tracking scripts. View and drop-off counts use an anonymous ID kept on your own server.

## Self-host it

With Docker:

~~~bash
docker build -t formloom .
docker run -d -p 3000:3000 -v formloom-data:/app/data -e APP_URL=https://forms.example.com formloom
~~~

Or with Node 22.13+ and pnpm:

~~~bash
pnpm install
pnpm dev   # http://localhost:3000
~~~

Sign up, and the first account gets a sample NPS form to try. Set \`ALLOW_SIGNUPS=false\` once you've made your account if the instance is just for you. The full walkthrough, including Cloudflare Workers, is in [how to self-host a form builder in 10 minutes](/blog/self-hosted-form-builder).

## Or use the hosted version

If you'd rather skip servers, the hosted version is the same code:

| | Free | Pro | Lifetime | Self-hosted |
| --- | --- | --- | --- | --- |
| Price | $0 | $6/mo billed yearly, or $8 monthly | $99 once | $0 |
| Responses | 1,000 a month | Unlimited | Unlimited | Unlimited |
| Badge | Shown | Optional | Optional | Optional |
| Every feature | Yes | Yes | Yes | Yes |

There are no seats. When a free account goes over 1,000 responses in a month, the form keeps working and every response is saved. The extra ones are held and show up as soon as you upgrade. Paid plans fund the open-source project.

## How it compares to other open-source options

The other well-known open-source option is [Formbricks](https://formbricks.com), licensed AGPLv3. It's built for in-product and website surveys and experience management, and its self-hosted stack includes Postgres, Redis/Valkey and several other services. If you want in-app surveys inside a product, look at it.

If you want Typeform-style standalone forms (lead forms, applications, feedback, quizzes) with the smallest possible footprint and a permissive MIT license, Formloom is the simpler fit.

## What Formloom doesn't do yet

To be straight about it: Formloom has no payment fields, file upload questions, video questions or team workspaces yet, and no native CRM integrations. You connect other tools through webhooks or the API. If you need those today, Typeform, Fillout or Jotform cover them. See [the best Typeform alternatives](/blog/best-typeform-alternatives) for the full picture.

## Get started

[Start free on the hosted version](/signup), or clone the repo from [GitHub](https://github.com/arjunkshah12345-hash/formloom) and run it yourself. Contributions and issues are welcome.

## Sources

- [Formbricks pricing and license](https://formbricks.com/pricing)
- [Formbricks Docker self-hosting docs](https://formbricks.com/docs/self-hosting/setup/docker)
`,
};

export default post;

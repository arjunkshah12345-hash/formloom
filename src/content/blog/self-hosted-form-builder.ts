import type { Post } from "./types";

const post: Post = {
  slug: "self-hosted-form-builder",
  title: "How to self-host a form builder in 10 minutes",
  description:
    "Self-host a free, open-source form builder in 10 minutes with Docker, Node or Cloudflare Workers. Step-by-step commands, config, backups and embeds.",
  date: "2026-11-22",
  keywords: [
    "self-hosted form builder",
    "self hosted typeform",
    "open source form builder",
    "self-host forms docker",
    "form builder sqlite",
    "on-premise form builder",
  ],
  tldr:
    "To self-host Formloom, an MIT-licensed Typeform alternative, run it with Docker (docker build, then docker run with a data volume), with Node 22.13+ and pnpm, or on Cloudflare Workers with D1. It is one process and one SQLite file, with no Postgres or Redis, and every feature is on with no response limits.",
  faq: [
    {
      q: "What is the easiest self-hosted form builder?",
      a: "Formloom is one of the simplest: a single Next.js process with an embedded SQLite database. Build the Docker image, run it with a volume, and you're done.",
    },
    {
      q: "How do I back up a self-hosted Formloom instance?",
      a: "Back up the data folder (/app/data in Docker). It holds the SQLite database and uploaded images, so that one folder is everything.",
    },
    {
      q: "Can I stop other people signing up on my instance?",
      a: "Yes. Create your account, then set ALLOW_SIGNUPS=false and restart.",
    },
    {
      q: "Does self-hosted Formloom have any limits?",
      a: "No. Self-hosted Formloom has no plans, no response caps and no metering. You can show or hide the badge.",
    },
  ],
  body: `
**You can self-host a full Typeform-style form builder in about 10 minutes with Formloom.** It's MIT licensed, runs as one Node process with one SQLite file, and needs no Postgres, Redis or queue. Pick Docker, plain Node, or Cloudflare Workers below. Self-hosted, every feature is on and nothing is metered.

## Why self-host your forms

- **Your data stays on your server.** Responses never pass through a third party.
- **No response caps.** Nothing stops your form on launch day.
- **No per-seat pricing.** Invite who you like.
- **Works inside private networks**, including offline or air-gapped ones.
- **You can change the code.** It's yours.

## What you need

- A machine with Docker, **or** Node 22.13+ and pnpm. Formloom uses Node's built-in \`node:sqlite\`, which is why it needs a recent Node.
- A domain name if the forms are public (optional for local use).
- About 10 minutes.

A small VPS is plenty for most use. There's one process and one database file.

## Option 1: Docker

Clone the repo and build the image:

~~~bash
git clone https://github.com/arjunkshah12345-hash/formloom.git
cd formloom
docker build -t formloom .
~~~

Run it with a named volume for data, and tell it its public URL:

~~~bash
docker run -d -p 3000:3000 \\
  -v formloom-data:/app/data \\
  -e APP_URL=https://forms.example.com \\
  formloom
~~~

Open \`http://localhost:3000\` (or your domain), sign up, and the first account gets a sample NPS form to try.

Everything lives in \`/app/data\`: the database and uploaded images. Back up that volume and you've backed up everything.

## Option 2: Node

If you'd rather run it directly:

~~~bash
git clone https://github.com/arjunkshah12345-hash/formloom.git
cd formloom
pnpm install
pnpm dev            # http://localhost:3000
~~~

That's the development server. For production, build and start it:

~~~bash
pnpm build
pnpm start
~~~

Run it under whatever you already use to keep processes alive (systemd, pm2, a container platform). By default the database is \`./data/formloom.db\` and uploads go in \`./data/uploads\`.

## Option 3: Cloudflare Workers

The hosted version of Formloom runs on Cloudflare Workers through OpenNext, with D1 in place of the SQLite file and Workers KV for uploaded images. To deploy your own:

~~~bash
npx wrangler d1 create formloom                # put the id in wrangler.jsonc
npx wrangler kv namespace create UPLOADS       # put the id in wrangler.jsonc
pnpm cf:deploy                                 # build, apply migrations, deploy
~~~

\`pnpm cf:deploy\` builds the app, applies the D1 migrations and deploys. Set \`APP_URL\` to your Workers URL or custom domain when you build.

## Configuration

Formloom is configured with environment variables. All are optional.

| Variable | Default | What it does |
| --- | --- | --- |
| \`APP_URL\` | From the request | Public base URL for share links and embeds |
| \`DATABASE_PATH\` | \`./data/formloom.db\` | SQLite database file |
| \`UPLOAD_DIR\` | \`./data/uploads\` | Uploaded images |
| \`ALLOW_SIGNUPS\` | \`true\` | Set \`false\` to lock the instance after you sign up |
| \`SECURE_COOKIES\` | On when \`APP_URL\` is https | Force the \`Secure\` cookie flag |
| \`GOOGLE_CLIENT_ID\` / \`GOOGLE_CLIENT_SECRET\` | Unset | Turn on "Continue with Google" |

Leave the Stripe variables unset. They only turn on the hosted plans.

For a private instance, the usual setup is: start it, create your account, then restart with \`ALLOW_SIGNUPS=false\`.

## Put it behind HTTPS

For public forms, put Formloom behind a reverse proxy that handles TLS (Caddy, nginx, Traefik or a tunnel) and forward traffic to port 3000. Set \`APP_URL\` to the https address so share links, QR codes and embeds use the right domain, and secure cookies switch on.

## Backups and upgrades

- **Backups:** copy the data folder (the SQLite database plus uploads). A nightly copy to object storage is plenty for most setups.
- **Upgrades:** pull the latest code, rebuild and restart. Database migrations are versioned and run by the app.

## Embed your forms

Once it's running, embed any form on your site:

~~~html
<!-- Inline -->
<iframe src="https://forms.example.com/f/abc123?embed=1" width="100%" height="560" style="border:0"></iframe>

<!-- Popup -->
<button data-formloom-popup="https://forms.example.com/f/abc123?embed=1">Give feedback</button>
<script src="https://forms.example.com/embed.js" async></script>
~~~

Add hidden fields to the URL, like \`?embed=1&source=pricing-page\`, and they're saved with each response.

## Get responses out

- **Webhooks:** every submission is POSTed as JSON. Set a secret and verify \`X-Formloom-Signature: sha256=<hex>\`, an HMAC-SHA256 of the raw body.
- **REST API:** create a key under API & account, then call \`/api/v1/forms\` and \`/api/v1/forms/:id/responses\` with \`Authorization: Bearer fl_…\`.
- **CSV export** from the responses table.

If you use an AI coding agent, [the agent setup prompt](/blog/ai-agent-forms) wires the embed and webhook into your app for you.

## Not ready to host?

The hosted version is the same code, free for 1,000 responses a month. [Start free](/signup), compare [plans](/#pricing), or read why [open source matters for forms](/blog/open-source-typeform-alternative). The source is on [GitHub](https://github.com/arjunkshah12345-hash/formloom).
`,
};

export default post;

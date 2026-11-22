# AGENTS.md

Notes for AI coding agents working on (or with) Formloom.

## What this is

Formloom is an open-source (MIT) Typeform alternative: conversational, one-question-at-a-time forms with logic,
themes, webhooks, a REST API and a remote MCP server. Next.js 16 (App Router), React 19, Tailwind 4. It runs as a
single Node process with SQLite, in Docker, or on Cloudflare Workers with D1.

## Using Formloom from an agent

- MCP server: `POST /api/mcp` (Streamable HTTP, JSON responses). Header `Authorization: Bearer fl_…`.
  Tools: `about_formloom`, `list_templates`, `list_forms`, `get_form`, `list_responses`, `create_form`, `publish_form`.
- REST API: `/api/v1/*`, described at `/openapi.json`. `POST /api/v1/forms` takes a simple spec
  (`title`, `questions[]` with `type` and `title`, optional `template`, `ending`, `webhookUrl`, `publish`).
- Human docs: `/docs/agents`. Machine summary: `/llms.txt` and `/llms-full.txt`.

## Working on the code

```sh
pnpm install
pnpm dev             # http://localhost:3000, SQLite in ./data
pnpm typecheck
pnpm lint
pnpm build
```

Cloudflare: `pnpm cf:build`, `pnpm cf:migrate` (D1 migrations in `migrations/`), `pnpm cf:deploy`.

## Map

- `src/lib/schema.ts`: the form model (`FormDefinition`, field types, `normalizeDefinition`). Start here.
- `src/lib/forms.ts`: storage for forms and responses. `src/lib/db.ts` picks SQLite or D1.
- `src/lib/agent-api.ts`: the agent-facing form spec, shared by the REST API and MCP. `src/lib/mcp.ts`: the MCP server.
- `src/lib/plans.ts`, `src/lib/billing.ts`: hosted plans and Stripe. Billing is off unless `STRIPE_SECRET_KEY` is set;
  self-hosted installs have no limits.
- `src/content/blog/*.ts`: blog posts (Markdown in a TS string). `src/lib/markdown.tsx` renders them.
- `src/app/f/[slug]`: the public form player. `src/app/forms/[id]/*`: the builder, results, share and settings.

## Conventions

- Server-only modules import `server-only`. Keep `schema.ts`, `plans.ts` and `agent-prompt.ts` safe to import anywhere.
- Prices live in `src/lib/plans.ts` and nowhere else; `llms.txt`, JSON-LD and the landing page read from it.
- Never commit secrets. Stripe keys and webhook secrets are Worker secrets or env vars.
- Run `pnpm typecheck && pnpm lint` before you finish.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Formloom

**Open-source, self-hostable conversational forms — an alternative to Typeform.**

Build beautiful one-question-at-a-time forms with logic jumps, answer recall, themes and real analytics, and keep every response on your own server. One Next.js app, one SQLite file, no external services.

**Try it hosted:** https://formloom.arjunkshah21.workers.dev — make an account, build a form and publish it. Or self-host it below.

## Features

**Respondent experience**
- Full-screen, one-question-at-a-time flow with smooth, direction-aware transitions
- Keyboard first: `Enter` to continue, `A`–`Z` to pick choices, `Y`/`N`, number keys for ratings and scales, `Shift+Enter` for new lines
- Progress bar, back/forward navigation, inline validation with friendly errors
- Works on mobile, embeds anywhere

**16 question types** — short text, long text, email, phone, website, number, multiple choice (single/multi, "Other", randomize, min/max picks), picture choice, searchable dropdown, yes/no, legal, rating (stars/hearts/circles), opinion scale, Net Promoter Score®, date, statement.

**Builder**
- Three-pane editor with a live, WYSIWYG canvas in your theme (desktop and mobile view)
- Drag-and-drop questions and choices, duplicate, type switching that keeps your content
- Logic jumps: `and`/`or` rules on any earlier answer, jump to questions or to one of several endings
- Answer recall (`{{field:…}}`) and hidden fields from the URL (`?source=newsletter`)
- Welcome screen, multiple endings, ending buttons and redirects
- Images per screen: stacked, split left/right, or wallpaper
- Themes: 9 presets, 12 Google Fonts, custom colors, background image with overlay, corner styles, alignment
- Autosave, undo/redo (`⌘Z` / `⌘⇧Z`), draft vs. published versions, preview mode
- Import/export forms as JSON; 7 starter templates

**Results**
- Views, starts, submissions, completion rate, average completion time
- Per-question drop-off funnel
- Charts for every question; NPS score with promoter/passive/detractor split
- Responses table with search, detail drawer, bulk delete, CSV export, date ranges

**Sharing & integrations**
- Public link, QR code, inline iframe, full-page and popup embeds (`/embed.js`)
- Close manually, by date or by response limit, with a custom closed message
- Webhooks with HMAC-SHA256 signatures (`X-Formloom-Signature`), retries and a delivery log
- REST API with API keys

## Quick start

Requires **Node 22.5+** (uses the built-in `node:sqlite`) and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Sign up — the first account gets a sample NPS form to play with.

### Docker

```bash
docker build -t formloom .
docker run -d -p 3000:3000 -v formloom-data:/app/data -e APP_URL=https://forms.example.com formloom
```

Back up the `/app/data` volume (database + uploaded images) and you've backed up everything.

### Cloudflare (Workers + D1)

The hosted version runs on Cloudflare Workers through [OpenNext](https://opennext.js.org/cloudflare), with D1 in place of the SQLite file and Workers KV for uploaded images. To run your own:

```bash
npx wrangler d1 create formloom                # put the id in wrangler.jsonc
npx wrangler kv namespace create UPLOADS       # put the id in wrangler.jsonc
pnpm cf:deploy                                 # build, apply migrations, deploy
```

Schema changes go in `migrations/` (for D1) and in `MIGRATIONS` in `src/lib/db.ts` (for SQLite).

### Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `APP_URL` | derived from request | Public base URL for share links and embeds |
| `DATABASE_PATH` | `./data/formloom.db` | SQLite database file |
| `UPLOAD_DIR` | `./data/uploads` | Uploaded images |
| `ALLOW_SIGNUPS` | `true` | Set `false` to lock the instance after creating your account |
| `SECURE_COOKIES` | on when `APP_URL` is https | Force the `Secure` cookie flag |

## Embedding

```html
<!-- Inline -->
<iframe src="https://forms.example.com/f/abc123?embed=1" width="100%" height="560" style="border:0"></iframe>

<!-- Popup -->
<button data-formloom-popup="https://forms.example.com/f/abc123?embed=1">Give feedback</button>
<script src="https://forms.example.com/embed.js" async></script>
```

Hidden fields work in every embed — append them to the URL: `?embed=1&source=pricing-page`.

## Webhooks

Each submission is POSTed as JSON:

```json
{
  "event": "form_response",
  "form": { "id": "form_…", "title": "Customer feedback" },
  "response": {
    "id": "r_…",
    "submittedAt": "2026-11-19T08:25:06.210Z",
    "durationMs": 27979,
    "endingId": "end_…",
    "hidden": { "source": "newsletter" },
    "answers": [{ "fieldId": "f_…", "type": "nps", "title": "…", "value": 9, "text": "9" }]
  }
}
```

If you set a signing secret, verify `X-Formloom-Signature: sha256=<hex>` as `HMAC_SHA256(secret, rawBody)`.

## REST API

Create a key under **API & account**, then:

```bash
curl https://forms.example.com/api/v1/forms -H "Authorization: Bearer fl_…"
```

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/v1/forms` | List forms |
| GET | `/api/v1/forms/:id` | Form definition (draft and published) |
| GET | `/api/v1/forms/:id/responses` | Responses — `limit`, `offset`, `since` (ms epoch) |

## How it works

- `src/lib/schema.ts` — the form model (fields, logic, theme, settings)
- `src/lib/engine.ts` — validation, branching, recall; runs in the browser **and** on the server, so submissions are re-validated and pruned to the path actually taken
- `src/components/player` — the respondent experience
- `src/components/builder` — the editor
- `src/lib/db.ts` — SQLite with versioned migrations

## License

MIT

## Credits

The marketing site and auth screens use components copied in from these registries (the source lives in this repo, no runtime package):

- [dithercn](https://dithercn.dev) (MIT): `src/components/dithercn`, `src/lib/dither`: dithered text, fades, charts and the globe.
- [asciicn](https://asciicn.sumak.dev): `src/components/ascii`, `src/lib/ascii`: ASCII wordmark, scramble text and backgrounds.
- [gradients.sh](https://gradients.sh) free components (MIT): `src/components/gradients`, `src/lib/gradient-engine`: WebGPU/WebGL aurora, grain and border gradients.
- [hmm.css](https://github.com/arjunkshah12345-hash/hmm.css): `src/styles/hmm.min.css`: rolling words, shimmer, dots and carets.

Type is set in [Funnel Display](https://fonts.google.com/specimen/Funnel+Display), [Geist](https://vercel.com/font) and [Martian Mono](https://fonts.google.com/specimen/Martian+Mono).

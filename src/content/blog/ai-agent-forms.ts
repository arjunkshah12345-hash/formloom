import type { Post } from "./types";

const post: Post = {
  slug: "ai-agent-forms",
  title: "Add forms to your app with Claude Code, Cursor or Codex",
  description:
    "Let Claude Code, Cursor or Codex add forms to your app: Formloom's agent setup prompt, remote MCP server, REST API and llms.txt, with copy-paste examples.",
  date: "2026-11-22",
  keywords: [
    "ai agent forms",
    "mcp form builder",
    "claude code forms",
    "cursor form builder",
    "form builder api",
    "typeform mcp alternative",
    "llms.txt",
  ],
  tldr:
    "Formloom gives AI coding agents three ways in: a copy-paste agent setup prompt that embeds a form and builds a signed webhook handler, a remote MCP server at /api/mcp that can list forms, create them from templates or JSON, publish them and read responses, and a REST API with an OpenAPI spec. All of it works on the free plan and on self-hosted installs.",
  faq: [
    {
      q: "Can Claude or Cursor create a form for me?",
      a: "Yes. Connect Formloom's MCP server (https://<your Formloom URL>/api/mcp with an API key as a Bearer token) and the agent can create a form from a template or a list of questions, publish it and give you the public link.",
    },
    {
      q: "What is the agent setup prompt?",
      a: "A button in Formloom that copies a ready-made prompt for Claude Code, Cursor or Codex. It tells the agent how to embed your form, build a webhook endpoint that verifies the HMAC signature, read responses through the REST API and add the env vars to .env.example.",
    },
    {
      q: "Does the MCP server cost extra?",
      a: "No. It uses the same API keys as the REST API and works on the free hosted plan and on self-hosted installs.",
    },
  ],
  body: `
**The fastest way to add a form to your app in 2026 is to ask your coding agent to do it.** Formloom, an open-source Typeform alternative, is built for that. Paste its agent setup prompt into Claude Code, Cursor or Codex and the agent embeds the form and writes the webhook handler. Connect its MCP server and the agent can create, publish and read forms itself. Prefer plain HTTP? There's a REST API with an OpenAPI spec.

## The three ways in

| | What it's for | Needs |
| --- | --- | --- |
| Agent setup prompt | Wiring an existing form into your codebase | Copy and paste |
| MCP server (\`/api/mcp\`) | Letting an agent create forms and read responses | API key |
| REST API + OpenAPI | Your own code, scripts and tools | API key |

Plus \`/llms.txt\`, a plain-text summary of Formloom for language models.

## 1. The agent setup prompt

In Formloom, the "Copy agent setup prompt" button copies a prompt written for coding agents. Paste it into Claude Code, Cursor, Codex or any agent that can edit your project. It includes your Formloom URL, which form to use and where to get an API key, and tells the agent to:

1. Look at how your project is built (framework, routing, env handling) before changing anything.
2. Embed the form where you ask, either inline with an iframe or as a popup with the \`embed.js\` script, and prefill hidden fields with query parameters.
3. Add a POST endpoint for the webhook, verify the \`x-formloom-signature\` header (\`sha256=\` plus a hex HMAC-SHA256 of the raw body) with a constant-time compare, and respond 2xx quickly since Formloom retries on 5xx.
4. Read past responses with the REST API, server side only.
5. Add \`FORMLOOM_API_KEY\` and \`FORMLOOM_WEBHOOK_SECRET\` to \`.env.example\` without real values.
6. Run your project's checks and tell you what's left to do in Formloom, like pasting the webhook URL.

The point of a prompt over docs is that the agent gets exact, current details (payload shape, header name, endpoints) in one place, and it adapts them to your stack. The same prompt works in a Next.js app, a Rails app or a Go service.

## 2. The MCP server

The [Model Context Protocol](https://modelcontextprotocol.io) lets AI clients call tools on remote servers. Formloom runs an MCP server over Streamable HTTP at \`/api/mcp\`. Authenticate with an API key from your account page as a Bearer token.

It exposes these tools:

- **about_formloom**: what Formloom is and what it costs.
- **list_templates**: the starter templates and the question types \`create_form\` accepts.
- **list_forms**: your forms, with id, public slug, published state and response count.
- **get_form**: a form's full definition and its public URL.
- **list_responses**: submitted responses, newest first, with readable answers.
- **create_form**: a new form from a template, or from a title and a list of questions, with an optional ending, webhook URL and publish flag.
- **publish_form**: publish a form's latest draft.

### Connect it to Claude Code

~~~bash
claude mcp add --transport http formloom https://formloom.app/api/mcp \\
  --header "Authorization: Bearer fl_your_api_key"
~~~

For a self-hosted install, swap in your own domain.

### Connect it to Cursor or another MCP client

Most clients take a JSON config with a URL and headers:

~~~json
{
  "mcpServers": {
    "formloom": {
      "url": "https://formloom.app/api/mcp",
      "headers": { "Authorization": "Bearer fl_your_api_key" }
    }
  }
}
~~~

Check your client's docs for where this file lives. Clients that support remote MCP servers, like Claude and ChatGPT connectors, take the same URL.

### What you can ask

- "Make me an NPS survey for our beta users and publish it."
- "Create a job application form for a senior designer role, send responses to https://example.com/hooks/apply."
- "How many responses did the launch feedback form get this week? Summarize the complaints."

The agent picks a template or writes the questions, calls \`create_form\`, and hands you the public URL. Reading responses works the same way through \`list_responses\`.

## 3. The REST API

Everything the MCP server does is also available over HTTP. Create a key under API & account, then:

~~~bash
# List forms
curl https://forms.example.com/api/v1/forms \\
  -H "Authorization: Bearer fl_your_api_key"

# Create and publish a form
curl -X POST https://forms.example.com/api/v1/forms \\
  -H "Authorization: Bearer fl_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Feedback","questions":[{"type":"nps","title":"How likely are you to recommend us?"}],"publish":true}'

# Page through responses
curl "https://forms.example.com/api/v1/forms/FORM_ID/responses?limit=50" \\
  -H "Authorization: Bearer fl_your_api_key"
~~~

The create call returns the form's public \`url\`. The full spec is at \`/openapi.json\`, which you can also hand to an agent.

## 4. llms.txt

Formloom serves \`/llms.txt\` (and a longer \`/llms-full.txt\`): a plain-text summary of what Formloom does, its prices, the MCP endpoint, the API and links to these guides. Point an agent at it when it needs context, or add it to your docs tool.

## Receiving responses

Whatever creates the form, responses reach your app the same way. Each submission is POSTed as JSON:

~~~json
{
  "event": "form_response",
  "form": { "id": "form_…", "title": "Customer feedback" },
  "response": {
    "id": "r_…",
    "submittedAt": "2026-11-19T08:25:06.210Z",
    "durationMs": 27979,
    "hidden": { "source": "newsletter" },
    "answers": [{ "fieldId": "f_…", "type": "nps", "title": "…", "value": 9, "text": "9" }]
  }
}
~~~

Verify the signature before trusting it:

~~~ts
import crypto from "node:crypto";

export function isFromFormloom(rawBody: string, header: string, secret: string) {
  const expected = "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
}
~~~

Webhooks retry on failure and every delivery is logged.

## Why this matters for an open-source form builder

Hosted form tools usually gate their API behind higher plans or meter it with response caps. With Formloom, the API, webhooks and MCP server are on the free hosted plan, and a self-hosted install has no limits. Your agent can create as many forms as you want. See [the best Typeform alternatives](/blog/best-typeform-alternatives) for how this compares, or [self-host it](/blog/self-hosted-form-builder).

## Get started

[Create a free account](/signup), make an API key, and paste the agent setup prompt into your editor. The code, including the MCP server, is on [GitHub](https://github.com/arjunkshah12345-hash/formloom).
`,
};

export default post;

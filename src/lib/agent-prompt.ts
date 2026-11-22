/**
 * The prompt people paste into their coding agent (Claude Code, Cursor, Codex…) to wire Formloom into their app.
 * Pure string building so it runs on the server and in the browser.
 */
export function agentPrompt({
  base,
  apiKey,
  form,
}: {
  base: string;
  apiKey?: string;
  form?: { id: string; slug: string; title: string };
}) {
  const key = apiKey ?? "fl_YOUR_API_KEY";
  const slug = form?.slug ?? "YOUR_FORM_SLUG";
  const keyLine = apiKey
    ? `API key: ${apiKey}  (secret: put it in an environment variable named FORMLOOM_API_KEY, never in client code or git)`
    : `API key: create one at ${base}/account and store it as FORMLOOM_API_KEY. Ask me for it if it is not set.`;
  const formLine = form
    ? `Form to use: "${form.title}" (id ${form.id}, public slug ${form.slug})`
    : `Form to use: ask me which form, or list them with the API below and pick the one I name.`;

  return `Set up Formloom forms in this project.

Formloom is an open-source Typeform alternative. Forms are built at ${base} and this project should show them and receive their responses.

${keyLine}
${formLine}

Do this:
1. Look at how this project is built (framework, routing, env handling) before changing anything.
2. Embed the form where I ask (or on a /feedback page if I didn't say). Use one of:
   - Inline: <iframe src="${base}/f/${slug}?embed=1" width="100%" height="600" style="border:0;border-radius:12px" allow="clipboard-write" title="Form"></iframe>
   - Popup: <button data-formloom-popup="${base}/f/${slug}?embed=1">Open form</button> plus <script src="${base}/embed.js" async></script> once per page.
   Prefill hidden fields with query params, e.g. ?embed=1&email=… when the form defines them.
3. Receive responses with a webhook. Add a POST endpoint (e.g. /api/formloom-webhook). Formloom sends JSON:
   { "event": "form_response", "form": { "id", "title" }, "response": { "id", "submittedAt", "durationMs", "hidden", "answers": [{ "fieldId", "type", "title", "value", "text" }] } }
   If I set a webhook secret, verify the header x-formloom-signature: "sha256=" + hex HMAC-SHA256 of the raw body with the secret (FORMLOOM_WEBHOOK_SECRET), using a constant-time compare. Respond 2xx quickly; Formloom retries on 5xx.
   Then tell me the endpoint URL to paste into the form's Share → Webhook settings.
4. Where the app needs past responses, read them with the REST API (server side only):
   GET ${base}/api/v1/forms  → { data: [{ id, slug, title, published, closed, responses, ... }] }
   GET ${base}/api/v1/forms/{id}  → the form definition
   GET ${base}/api/v1/forms/{id}/responses?limit=100&offset=0&since=<ms epoch>  → { total, data: [response] }
   POST ${base}/api/v1/forms  with {"title","questions":[{"type","title","choices"?}],"publish":true}  → { id, url, embed } (creates a form)
   Header: Authorization: Bearer ${apiKey ? "$FORMLOOM_API_KEY" : key}
   Full spec: ${base}/openapi.json. An MCP server with the same tools is at ${base}/api/mcp (same Bearer header).
5. Add FORMLOOM_API_KEY (and FORMLOOM_WEBHOOK_SECRET if used) to .env.example without real values.
6. Run the project's checks, then summarise what you changed and anything I still need to do in Formloom.

Docs and source: https://github.com/arjunkshah12345-hash/formloom`;
}

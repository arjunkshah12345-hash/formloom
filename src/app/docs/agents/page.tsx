import type { Metadata } from "next";
import Link from "next/link";
import { BlogShell } from "@/components/blog/BlogShell";
import { CopyCode } from "@/components/blog/CopyCode";
import { JsonLd } from "@/components/seo/JsonLd";
import { FIELD_TYPES, listTemplates } from "@/lib/agent-api";
import { agentPrompt } from "@/lib/agent-prompt";
import { TOOLS } from "@/lib/mcp";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Formloom for AI agents: MCP server, REST API and llms.txt",
  description:
    "Let Claude, ChatGPT, Cursor or any AI agent create forms, publish them and read responses. Formloom has a remote MCP server, an OpenAPI-described REST API and llms.txt.",
  alternates: { canonical: "/docs/agents" },
};

const MCP_URL = `${SITE_URL}/api/mcp`;

const configs: { label: string; code: string }[] = [
  {
    label: "Claude Code",
    code: `claude mcp add --transport http formloom ${MCP_URL} \\\n  --header "Authorization: Bearer $FORMLOOM_API_KEY"`,
  },
  {
    label: "Cursor · .cursor/mcp.json",
    code: JSON.stringify({ mcpServers: { formloom: { url: MCP_URL, headers: { Authorization: "Bearer fl_YOUR_API_KEY" } } } }, null, 2),
  },
  {
    label: "VS Code · .vscode/mcp.json",
    code: JSON.stringify(
      {
        inputs: [{ type: "promptString", id: "formloom-key", description: "Formloom API key", password: true }],
        servers: { formloom: { type: "http", url: MCP_URL, headers: { Authorization: "Bearer ${input:formloom-key}" } } },
      },
      null,
      2,
    ),
  },
  {
    label: "Codex · ~/.codex/config.toml",
    code: `[mcp_servers.formloom]\nurl = "${MCP_URL}"\nbearer_token_env_var = "FORMLOOM_API_KEY"`,
  },
  {
    label: "Claude Desktop, Windsurf and stdio-only clients",
    code: JSON.stringify(
      { mcpServers: { formloom: { command: "npx", args: ["-y", "mcp-remote", MCP_URL, "--header", "Authorization:Bearer ${FORMLOOM_API_KEY}"], env: { FORMLOOM_API_KEY: "fl_YOUR_API_KEY" } } } },
      null,
      2,
    ),
  },
];

const createExample = `curl -X POST ${SITE_URL}/api/v1/forms \\
  -H "Authorization: Bearer $FORMLOOM_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Beta waitlist",
    "description": "Two quick questions and you are on the list.",
    "questions": [
      { "type": "email", "title": "Your work email?" },
      { "type": "multiple_choice", "title": "What will you use it for?", "choices": ["Surveys", "Lead capture", "Research"] }
    ],
    "ending": { "title": "You are in. We will email you soon." },
    "publish": true
  }'
# → { "id": "form_…", "url": "${SITE_URL}/f/…", "embed": "<iframe …>", … }`;

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="mt-16 scroll-mt-20 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
    {children}
  </h2>
);

export default function AgentsDocs() {
  return (
    <BlogShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Formloom for AI agents",
          url: `${SITE_URL}/docs/agents`,
          about: { "@type": "SoftwareApplication", name: "Formloom", applicationCategory: "BusinessApplication" },
        }}
      />
      <main className="mx-auto max-w-[820px] px-5 pt-16 pb-24 text-ink-2">
        <p className="font-tech text-[11px] tracking-[0.16em] text-accent uppercase">Docs · AI agents</p>
        <h1 className="mt-4 font-heading text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.02] font-medium tracking-[-0.04em] text-ink">
          Forms your agent can build, ship and read.
        </h1>
        <p className="mt-5 text-lg">
          Ask Claude, ChatGPT, Cursor or Codex for &ldquo;a feedback form with an NPS question&rdquo; and get back a live link. Formloom has
          a remote MCP server, a REST API described by OpenAPI, and an <a className="text-ink underline" href="/llms.txt">llms.txt</a>.
          Everything is open source, so agents can also read the code.
        </p>
        <nav className="mt-8 flex flex-wrap gap-2 text-sm">
          {[
            ["#mcp", "MCP server"],
            ["#rest", "REST API"],
            ["#prompt", "Setup prompt"],
            ["#llms", "llms.txt"],
          ].map(([h, l]) => (
            <a key={h} href={h} className="rounded-full border border-line px-4 py-2 transition hover:border-line-2 hover:text-ink">
              {l}
            </a>
          ))}
        </nav>

        <H2 id="mcp">1. Connect the MCP server</H2>
        <p className="mt-4">
          URL <code className="text-ink">{MCP_URL}</code> (Streamable HTTP). Create an API key in{" "}
          <Link className="text-ink underline" href="/account">
            Account
          </Link>{" "}
          and send it as a Bearer token. Without a key, <code>about_formloom</code> and <code>list_templates</code> still work.
        </p>
        {configs.map((c) => (
          <CopyCode key={c.label} label={c.label} code={c.code} />
        ))}
        <div className="mt-8 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] font-tech text-[10px] tracking-wide text-ink-3 uppercase">
              <tr>
                <th className="px-4 py-3">Tool</th>
                <th className="px-4 py-3">What it does</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((t) => (
                <tr key={t.name} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-mono text-[13px] text-ink">{t.name}</td>
                  <td className="px-4 py-3">{t.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6">Try asking your agent:</p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>&ldquo;Make a Formloom RSVP form for Friday&rsquo;s dinner and give me the link.&rdquo;</li>
          <li>&ldquo;Summarise this week&rsquo;s responses to my customer feedback form.&rdquo;</li>
          <li>&ldquo;Create a job application form from the template and post responses to https://example.com/hooks/hire.&rdquo;</li>
        </ul>

        <H2 id="rest">2. Or call the REST API</H2>
        <p className="mt-4">
          Full spec: <a className="text-ink underline" href="/openapi.json">/openapi.json</a>. Question types:{" "}
          {FIELD_TYPES.map((t, i) => (
            <span key={t}>
              <code>{t}</code>
              {i < FIELD_TYPES.length - 1 ? ", " : "."}
            </span>
          ))}{" "}
          Templates: {listTemplates().map((t) => t.key).join(", ")}.
        </p>
        <CopyCode label="Create and publish a form" code={createExample} />
        <CopyCode
          label="Other endpoints"
          code={`GET  /api/v1/forms                    list your forms
GET  /api/v1/forms/{id}               form definition
POST /api/v1/forms/{id}/publish       publish the latest draft
GET  /api/v1/forms/{id}/responses     ?limit=100&offset=0&since=<ms>
GET  /api/v1/templates                templates and question types (no auth)`}
        />

        <H2 id="prompt">3. Wire forms into an app with a coding agent</H2>
        <p className="mt-4">
          Paste this into Claude Code, Cursor or Codex inside your project. It embeds a form, adds a signed webhook endpoint and reads
          responses server side. Signed in, the version on your form&rsquo;s Share page already contains your key and form.
        </p>
        <CopyCode label="Agent setup prompt" code={agentPrompt({ base: SITE_URL })} />

        <H2 id="llms">4. For models reading the web</H2>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>
            <a className="text-ink underline" href="/llms.txt">/llms.txt</a>: what Formloom is, prices and links, in Markdown.
          </li>
          <li>
            <a className="text-ink underline" href="/llms-full.txt">/llms-full.txt</a>: the same plus the full text of every guide.
          </li>
          <li>
            Every blog post has a Markdown twin: add <code>.md</code> to its URL, e.g.{" "}
            <a className="text-ink underline" href="/blog/best-typeform-alternatives.md">/blog/best-typeform-alternatives.md</a>.
          </li>
          <li>Crawlers from OpenAI, Anthropic, Perplexity, Google and others are allowed in robots.txt.</li>
        </ul>
      </main>
    </BlogShell>
  );
}

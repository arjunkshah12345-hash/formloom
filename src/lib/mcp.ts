import {
  apiCreateForm,
  apiGetForm,
  apiListForms,
  apiListResponses,
  apiPublishForm,
  FIELD_TYPES,
  listTemplates,
  SpecError,
  type FormSpec,
} from "./agent-api";
import type { User } from "./auth";
import { PLANS_SUMMARY } from "./agent-facts";

/** Formloom's remote MCP server: JSON-RPC 2.0 over Streamable HTTP (JSON responses, no SSE). */

export const MCP_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];

type Json = Record<string, unknown>;
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Json;
  annotations?: Json;
  auth: boolean;
  run: (args: Json, ctx: { user: User | null; base: string }) => Promise<unknown>;
};

const questionSchema = {
  type: "object",
  required: ["type", "title"],
  properties: {
    type: { type: "string", enum: FIELD_TYPES, description: "Question type." },
    title: { type: "string", description: "The question as the respondent sees it." },
    description: { type: "string" },
    required: { type: "boolean" },
    choices: { type: "array", items: { type: "string" }, description: "Options for multiple_choice, dropdown, picture_choice." },
    allowMultiple: { type: "boolean" },
    placeholder: { type: "string" },
  },
};

const idArg = { type: "object", required: ["form_id"], properties: { form_id: { type: "string" } } };

export const TOOLS: Tool[] = [
  {
    name: "about_formloom",
    title: "About Formloom",
    description:
      "What Formloom is, its pricing, and how to connect. Formloom is an open-source (MIT) Typeform alternative: conversational one-question-at-a-time forms, logic, webhooks, REST API and this MCP server. No API key needed.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
    auth: false,
    run: async (_a, { base }) => ({ ...PLANS_SUMMARY, signup: `${base}/signup`, apiKeys: `${base}/account`, docs: `${base}/docs/agents` }),
  },
  {
    name: "list_templates",
    title: "List templates",
    description: "Form templates (NPS, lead capture, job application, event RSVP, quiz…) and the question types create_form accepts. No API key needed.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
    auth: false,
    run: async () => ({ templates: listTemplates(), questionTypes: FIELD_TYPES }),
  },
  {
    name: "list_forms",
    title: "List forms",
    description: "The user's forms with id, public slug, published state and response count.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true },
    auth: true,
    run: async (_a, { user }) => ({ forms: await apiListForms(user!.id) }),
  },
  {
    name: "get_form",
    title: "Get form",
    description: "A form's full definition (questions, logic, theme, settings) and its public URL.",
    inputSchema: idArg,
    annotations: { readOnlyHint: true },
    auth: true,
    run: async (a, { user, base }) => (await apiGetForm(user!.id, String(a.form_id), base)) ?? fail("Form not found."),
  },
  {
    name: "list_responses",
    title: "List responses",
    description: "Submitted responses for a form, newest first. Each has answers with question titles and readable text.",
    inputSchema: {
      type: "object",
      required: ["form_id"],
      properties: {
        form_id: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 1000, default: 100 },
        offset: { type: "integer", minimum: 0, default: 0 },
        since: { type: "integer", description: "Only responses submitted at or after this Unix time in milliseconds." },
      },
    },
    annotations: { readOnlyHint: true },
    auth: true,
    run: async (a, { user }) =>
      (await apiListResponses(user!.id, String(a.form_id), a as { limit?: number; offset?: number; since?: number })) ??
      fail("Form not found."),
  },
  {
    name: "create_form",
    title: "Create form",
    description:
      "Create a form from a template or a list of questions. Set publish: true to make it live right away; returns the public URL and an embed snippet.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        description: { type: "string", description: "Shown on a welcome screen." },
        template: { type: "string", description: "Template key from list_templates. Use instead of questions." },
        questions: { type: "array", items: questionSchema, maxItems: 100 },
        ending: {
          type: "object",
          required: ["title"],
          properties: { title: { type: "string" }, description: { type: "string" }, redirectUrl: { type: "string" } },
        },
        webhookUrl: { type: "string", description: "https URL that receives each response as JSON." },
        publish: { type: "boolean", default: false },
      },
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    auth: true,
    run: async (a, { user, base }) => apiCreateForm(user!.id, a as unknown as FormSpec, base),
  },
  {
    name: "publish_form",
    title: "Publish form",
    description: "Publish a form's latest draft so its public URL serves it.",
    inputSchema: idArg,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    auth: true,
    run: async (a, { user, base }) => (await apiPublishForm(user!.id, String(a.form_id), base)) ?? fail("Form not found."),
  },
];

class ToolFailure extends Error {}
function fail(msg: string): never {
  throw new ToolFailure(msg);
}

export type Rpc = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Json };

const ok = (id: Rpc["id"], result: unknown) => ({ jsonrpc: "2.0", id, result });
const err = (id: Rpc["id"], code: number, message: string) => ({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });

export async function handleRpc(msg: Rpc, ctx: { user: User | null; base: string }) {
  if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") return err(msg?.id, -32600, "Invalid request");
  const isNotification = msg.id === undefined;
  switch (msg.method) {
    case "initialize": {
      const asked = String(msg.params?.protocolVersion ?? "");
      return ok(msg.id, {
        protocolVersion: MCP_PROTOCOL_VERSIONS.includes(asked) ? asked : MCP_PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "formloom", title: "Formloom", version: "1.0.0", websiteUrl: ctx.base },
        instructions:
          "Formloom builds conversational forms (an open-source Typeform alternative). Use create_form with publish: true to make a live form and share its url. " +
          (ctx.user ? `Signed in as ${ctx.user.name || "a Formloom user"}.` : `No API key was sent: only about_formloom and list_templates work. Create a key at ${ctx.base}/account and send it as "Authorization: Bearer fl_…".`),
      });
    }
    case "ping":
      return ok(msg.id, {});
    case "tools/list":
      return ok(msg.id, {
        tools: TOOLS.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations })),
      });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === msg.params?.name);
      if (!tool) return err(msg.id, -32602, `Unknown tool: ${String(msg.params?.name)}`);
      if (tool.auth && !ctx.user)
        return ok(msg.id, {
          isError: true,
          content: [{ type: "text", text: `This tool needs a Formloom API key. Create one at ${ctx.base}/account, then add the header "Authorization: Bearer fl_…" to this MCP server's config.` }],
        });
      try {
        const data = await tool.run((msg.params?.arguments as Json) ?? {}, ctx);
        return ok(msg.id, { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data });
      } catch (e) {
        if (e instanceof ToolFailure || e instanceof SpecError)
          return ok(msg.id, { isError: true, content: [{ type: "text", text: e.message }] });
        throw e;
      }
    }
    default:
      if (isNotification) return null;
      return err(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

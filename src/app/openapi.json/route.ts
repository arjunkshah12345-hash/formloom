import { FIELD_TYPES, listTemplates } from "@/lib/agent-api";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const ref = (n: string) => ({ $ref: `#/components/schemas/${n}` });
const json = (schema: object, description = "OK") => ({ description, content: { "application/json": { schema } } });
const idParam = { name: "id", in: "path", required: true, schema: { type: "string" } };
const errors = { "401": json(ref("Error"), "Missing or invalid API key"), "404": json(ref("Error"), "Form not found") };

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Formloom API",
      version: "1.0.0",
      description:
        "Create forms, publish them and read responses. Formloom is an open-source Typeform alternative. Create an API key in Account settings and send it as a Bearer token. The same operations are available as an MCP server at /api/mcp.",
      license: { name: "MIT", identifier: "MIT" },
    },
    servers: [{ url: SITE_URL }],
    security: [{ bearer: [] }],
    paths: {
      "/api/v1/forms": {
        get: { operationId: "listForms", summary: "List your forms", responses: { "200": json({ type: "object", properties: { data: { type: "array", items: ref("FormSummary") } } }), ...errors } },
        post: {
          operationId: "createForm",
          summary: "Create a form from questions or a template",
          requestBody: { required: true, content: { "application/json": { schema: ref("FormSpec") } } },
          responses: { "201": json(ref("CreatedForm"), "Created"), "400": json(ref("Error"), "Invalid spec"), ...errors },
        },
      },
      "/api/v1/forms/{id}": {
        get: { operationId: "getForm", summary: "Get a form's definition", parameters: [idParam], responses: { "200": json({ type: "object" }), ...errors } },
      },
      "/api/v1/forms/{id}/publish": {
        post: { operationId: "publishForm", summary: "Publish the latest draft", parameters: [idParam], responses: { "200": json({ type: "object", properties: { id: { type: "string" }, published: { type: "boolean" }, url: { type: "string" } } }), ...errors } },
      },
      "/api/v1/forms/{id}/responses": {
        get: {
          operationId: "listResponses",
          summary: "List responses, newest first",
          parameters: [
            idParam,
            { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 1000, default: 100 } },
            { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
            { name: "since", in: "query", description: "Unix time in milliseconds", schema: { type: "integer" } },
          ],
          responses: { "200": json({ type: "object", properties: { total: { type: "integer" }, limit: { type: "integer" }, offset: { type: "integer" }, data: { type: "array", items: ref("Response") } } }), ...errors },
        },
      },
      "/api/v1/templates": {
        get: { operationId: "listTemplates", summary: "Templates and question types (no auth)", security: [], responses: { "200": json({ type: "object" }) } },
      },
    },
    components: {
      securitySchemes: { bearer: { type: "http", scheme: "bearer", description: "API key starting with fl_" } },
      schemas: {
        Error: { type: "object", properties: { error: { type: "string" } } },
        FormSummary: {
          type: "object",
          properties: {
            id: { type: "string" }, slug: { type: "string" }, title: { type: "string" }, published: { type: "boolean" },
            closed: { type: "boolean" }, responses: { type: "integer" }, lastResponseAt: { type: ["string", "null"] }, updatedAt: { type: "string" },
          },
        },
        Question: {
          type: "object",
          required: ["type", "title"],
          properties: {
            type: { type: "string", enum: FIELD_TYPES }, title: { type: "string" }, description: { type: "string" }, required: { type: "boolean" },
            choices: { type: "array", items: { type: "string" } }, allowMultiple: { type: "boolean" }, placeholder: { type: "string" },
          },
        },
        FormSpec: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string", description: "Adds a welcome screen" },
            template: { type: "string", enum: listTemplates().map((t) => t.key), description: "Use instead of questions" },
            questions: { type: "array", items: ref("Question"), maxItems: 100 },
            ending: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, redirectUrl: { type: "string" } } },
            webhookUrl: { type: "string", format: "uri" },
            publish: { type: "boolean", default: false },
          },
          example: { title: "Product feedback", questions: [{ type: "nps", title: "How likely are you to recommend us?" }, { type: "long_text", title: "What should we improve?", required: false }], publish: true },
        },
        CreatedForm: {
          type: "object",
          properties: { id: { type: "string" }, slug: { type: "string" }, title: { type: "string" }, published: { type: "boolean" }, url: { type: "string" }, editUrl: { type: "string" }, embed: { type: "string" } },
        },
        Response: {
          type: "object",
          properties: {
            id: { type: "string" }, submittedAt: { type: "string" }, durationMs: { type: "integer" }, hidden: { type: "object" },
            answers: { type: "array", items: { type: "object", properties: { fieldId: { type: "string" }, type: { type: "string" }, title: { type: "string" }, value: {}, text: { type: "string" } } } },
          },
        },
      },
    },
  };
  return Response.json(spec, { headers: { "Access-Control-Allow-Origin": "*" } });
}

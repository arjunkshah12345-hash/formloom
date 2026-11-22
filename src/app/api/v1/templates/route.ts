import { FIELD_TYPES, listTemplates } from "@/lib/agent-api";

export const dynamic = "force-static";

/** Public: the templates and question types POST /api/v1/forms accepts. */
export function GET() {
  return Response.json({ templates: listTemplates(), questionTypes: FIELD_TYPES });
}

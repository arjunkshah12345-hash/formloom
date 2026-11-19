import { countResponses, getForm, listResponses } from "@/lib/forms";
import { responsePayload } from "@/lib/webhooks";
import { apiUser, unauthorized } from "../../../_auth";

export async function GET(req: Request, ctx: RouteContext<"/api/v1/forms/[id]/responses">) {
  const user = apiUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const form = getForm(id, user.id);
  if (!form) return Response.json({ error: "Not found" }, { status: 404 });
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(Number(sp.get("limit")) || 100, 1), 1000);
  const offset = Math.max(Number(sp.get("offset")) || 0, 0);
  const since = Number(sp.get("since")) || 0;
  const rows = listResponses(form.id, { limit, offset, since });
  return Response.json({
    total: countResponses(form.id),
    limit,
    offset,
    data: rows.map((r) => responsePayload(form.id, form.published ?? form.draft, r).response),
  });
}

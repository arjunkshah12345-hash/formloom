import { apiPublishForm } from "@/lib/agent-api";
import { apiUser, baseUrl, unauthorized } from "../../../_auth";

export async function POST(req: Request, ctx: RouteContext<"/api/v1/forms/[id]/publish">) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const res = await apiPublishForm(user.id, (await ctx.params).id, baseUrl(req));
  return res ? Response.json(res) : Response.json({ error: "Not found" }, { status: 404 });
}

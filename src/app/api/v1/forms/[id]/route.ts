import { getForm } from "@/lib/forms";
import { apiUser, unauthorized } from "../../_auth";

export async function GET(req: Request, ctx: RouteContext<"/api/v1/forms/[id]">) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const form = await getForm(id, user.id);
  if (!form) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ id: form.id, slug: form.slug, draft: form.draft, published: form.published });
}

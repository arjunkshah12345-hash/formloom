import { getCurrentUser } from "@/lib/auth";
import { getForm, listResponses } from "@/lib/forms";
import { rangeSince } from "@/lib/range";
import { toCsv } from "@/lib/summary";

export async function GET(req: Request, ctx: RouteContext<"/api/forms/[id]/export">) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const form = await getForm(id, user.id);
  if (!form) return new Response("Not found", { status: 404 });
  const { since } = rangeSince(new URL(req.url).searchParams.get("range") ?? undefined);
  const csv = toCsv(form.draft, await listResponses(form.id, { since }));
  const name = form.title.replace(/[^\w-]+/g, "-").toLowerCase() || "responses";
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}-responses.csv"`,
    },
  });
}

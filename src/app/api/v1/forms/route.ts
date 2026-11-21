import { listForms } from "@/lib/forms";
import { apiUser, unauthorized } from "../_auth";

export async function GET(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return Response.json({
    data: (await listForms(user.id)).map((f) => ({
      id: f.id,
      slug: f.slug,
      title: f.title,
      published: f.isPublished,
      closed: f.isClosed,
      responses: f.responseCount,
      lastResponseAt: f.lastResponseAt ? new Date(f.lastResponseAt).toISOString() : null,
      updatedAt: new Date(f.updatedAt).toISOString(),
    })),
  });
}

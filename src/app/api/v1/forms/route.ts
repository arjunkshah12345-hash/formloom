import { apiCreateForm, apiListForms, SpecError, type FormSpec } from "@/lib/agent-api";
import { apiUser, baseUrl, unauthorized } from "../_auth";

export async function GET(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  return Response.json({ data: await apiListForms(user.id) });
}

/** Create a form from a template or a list of questions. See /openapi.json. */
export async function POST(req: Request) {
  const user = await apiUser(req);
  if (!user) return unauthorized();
  let spec: FormSpec;
  try {
    spec = await req.json();
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }
  try {
    return Response.json(await apiCreateForm(user.id, spec, baseUrl(req)), { status: 201 });
  } catch (e) {
    if (e instanceof SpecError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }
}

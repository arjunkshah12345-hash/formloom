import { userFromApiKey } from "@/lib/auth";

export function apiUser(req: Request) {
  return userFromApiKey(req.headers.get("authorization"));
}

export const unauthorized = () =>
  Response.json({ error: "Missing or invalid API key. Send `Authorization: Bearer fl_…`." }, { status: 401 });

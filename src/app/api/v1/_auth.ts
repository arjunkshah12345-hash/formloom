import { userFromApiKey } from "@/lib/auth";

export function apiUser(req: Request) {
  return userFromApiKey(req.headers.get("authorization"));
}

export const unauthorized = () =>
  Response.json({ error: "Missing or invalid API key. Send `Authorization: Bearer fl_…`." }, { status: 401 });

/** Public base URL for links returned to API callers. */
export const baseUrl = (req: Request) => (process.env.APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");

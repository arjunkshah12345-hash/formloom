import { userFromApiKey } from "@/lib/auth";
import { handleRpc, type Rpc } from "@/lib/mcp";
import { baseUrl } from "../v1/_auth";

/**
 * Remote MCP server (Streamable HTTP, stateless). Add it to an MCP client as
 *   https://<host>/api/mcp  with header  Authorization: Bearer fl_…
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Mcp-Session-Id, Mcp-Protocol-Version",
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400, headers: CORS });
  }
  const ctx = { user: await userFromApiKey(req.headers.get("authorization")), base: baseUrl(req) };
  const batch = Array.isArray(body);
  const out = (await Promise.all(((batch ? body : [body]) as Rpc[]).map((m) => handleRpc(m, ctx)))).filter(Boolean);
  if (!out.length) return new Response(null, { status: 202, headers: CORS });
  return Response.json(batch ? out : out[0], { headers: CORS });
}

export function GET() {
  // No server-initiated stream: this server only answers requests.
  return new Response("Formloom MCP server. POST JSON-RPC here; see /docs/agents.", { status: 405, headers: { ...CORS, Allow: "POST" } });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

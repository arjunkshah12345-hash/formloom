import { NextResponse } from "next/server";
import { getFormBySlug, recordEvent, type EventType } from "@/lib/forms";

const TYPES = new Set<EventType>(["view", "start", "reach"]);

export async function POST(req: Request, ctx: RouteContext<"/api/f/[slug]/events">) {
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { type?: string; fieldId?: string; visitor?: string } | null;
  if (!body?.visitor || !TYPES.has(body.type as EventType)) return new NextResponse(null, { status: 204 });
  const form = getFormBySlug(slug);
  if (form?.published) recordEvent(form.id, body.visitor, body.type as EventType, body.fieldId ?? "");
  return new NextResponse(null, { status: 204 });
}

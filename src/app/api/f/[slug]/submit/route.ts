import { after, NextResponse } from "next/server";
import { closedReason } from "@/lib/closed";
import { nextStep, sanitizeAnswers, validateAnswer, visiblePath } from "@/lib/engine";
import { getFormBySlug, insertResponse } from "@/lib/forms";
import { deliverWebhook } from "@/lib/webhooks";

export async function POST(req: Request, ctx: RouteContext<"/api/f/[slug]/submit">) {
  const { slug } = await ctx.params;
  const form = await getFormBySlug(slug);
  const def = form?.published;
  if (!form || !def) return NextResponse.json({ error: "Form not found" }, { status: 404 });
  const closed = await closedReason(form);
  if (closed) return NextResponse.json({ error: closed }, { status: 403 });

  const body = (await req.json().catch(() => null)) as {
    answers?: Record<string, unknown>;
    hidden?: Record<string, unknown>;
    startedAt?: number;
  } | null;
  if (!body || typeof body.answers !== "object" || body.answers === null) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const { answers, errors } = sanitizeAnswers(def, body.answers);
  const firstError = Object.entries(errors)[0];
  if (firstError) return NextResponse.json({ error: firstError[1], fieldId: firstError[0] }, { status: 422 });

  // Re-walk the logic on the server: only keep answers on the taken path and
  // make sure every required question on that path is answered.
  const path = visiblePath(def, answers);
  for (const id of path) {
    const field = def.fields.find((f) => f.id === id)!;
    const err = validateAnswer(field, answers[id]);
    if (err) return NextResponse.json({ error: err, fieldId: id }, { status: 422 });
  }
  const onPath = new Set(path);
  const kept = Object.fromEntries(Object.entries(answers).filter(([k]) => onPath.has(k)));
  const last = path[path.length - 1];
  const ending = last ? nextStep(def, last, kept) : { kind: "ending" as const, id: def.endings[0]?.id };

  const hidden: Record<string, string> = {};
  for (const key of def.settings.hiddenFields) {
    const v = body.hidden?.[key];
    if (typeof v === "string" && v) hidden[key] = v.slice(0, 500);
  }

  const now = Date.now();
  const startedAt =
    typeof body.startedAt === "number" && body.startedAt < now && now - body.startedAt < 864e5 * 7
      ? body.startedAt
      : null;
  const ua = req.headers.get("user-agent") ?? "";
  const response = await insertResponse(form.id, {
    answers: kept,
    hidden,
    meta: {
      userAgent: ua.slice(0, 300),
      referrer: (req.headers.get("referer") ?? "").slice(0, 300),
      device: /mobile|android|iphone/i.test(ua) ? "mobile" : /ipad|tablet/i.test(ua) ? "tablet" : "desktop",
    },
    endingId: ending.id ?? null,
    startedAt,
    durationMs: startedAt ? now - startedAt : null,
  });

  if (def.settings.webhookUrl) after(() => deliverWebhook(form.id, def, response));

  return NextResponse.json({ ok: true, id: response.id, endingId: ending.id });
}

import "server-only";
import crypto from "node:crypto";
import { formatAnswer } from "./engine";
import { logWebhook, type ResponseRow } from "./forms";
import type { FormDefinition } from "./schema";

export function responsePayload(formId: string, def: FormDefinition, r: ResponseRow) {
  return {
    event: "form_response",
    form: { id: formId, title: def.title },
    response: {
      id: r.id,
      submittedAt: new Date(r.submittedAt).toISOString(),
      durationMs: r.durationMs,
      endingId: r.endingId,
      hidden: r.hidden,
      answers: def.fields
        .filter((f) => f.type !== "statement" && r.answers[f.id] !== undefined)
        .map((f) => ({
          fieldId: f.id,
          type: f.type,
          title: f.title,
          value: r.answers[f.id],
          text: formatAnswer(f, r.answers[f.id]),
        })),
    },
  };
}

/** POST the response to the form's webhook, signing it when a secret is set. */
export async function deliverWebhook(formId: string, def: FormDefinition, r: ResponseRow) {
  const url = def.settings.webhookUrl;
  if (!url) return;
  const body = JSON.stringify(responsePayload(formId, def, r));
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "user-agent": "Formloom-Webhook/1.0",
  };
  if (def.settings.webhookSecret) {
    const sig = crypto.createHmac("sha256", def.settings.webhookSecret).update(body).digest("hex");
    headers["x-formloom-signature"] = `sha256=${sig}`;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(8000) });
      logWebhook(formId, r.id, url, res.status, res.ok ? null : `HTTP ${res.status}`);
      if (res.ok || res.status < 500) return;
    } catch (e) {
      logWebhook(formId, r.id, url, null, e instanceof Error ? e.message : "Request failed");
    }
    await new Promise((ok) => setTimeout(ok, 1000 * 2 ** attempt));
  }
}

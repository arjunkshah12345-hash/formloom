"use server";

import crypto from "node:crypto";
import { requireUser } from "@/lib/auth";
import { getForm, logWebhook } from "@/lib/forms";
import { normalizeDefinition, type FormDefinition } from "@/lib/schema";
import { responsePayload } from "@/lib/webhooks";

/** Send a sample payload to the webhook currently configured in the editor. */
export async function sendTestWebhook(formId: string, draft: FormDefinition) {
  const user = await requireUser();
  const form = await getForm(formId, user.id);
  if (!form) return { ok: false, error: "Form not found" };
  const def = normalizeDefinition(draft);
  const url = def.settings.webhookUrl;
  if (!url || !/^https?:\/\//.test(url)) return { ok: false, error: "Enter a valid http(s) URL" };
  const sample = Object.fromEntries(
    def.fields
      .filter((f) => f.type !== "statement")
      .map((f) => [
        f.id,
        f.properties.choices?.length
          ? [f.properties.choices[0].id]
          : ["rating", "opinion_scale", "nps", "number"].includes(f.type)
            ? 7
            : f.type === "yes_no" || f.type === "legal"
              ? true
              : f.type === "date"
                ? "2026-01-01"
                : "Sample answer",
      ]),
  );
  const payload = {
    ...responsePayload(formId, def, {
      id: "r_test",
      answers: sample,
      hidden: {},
      meta: {},
      endingId: def.endings[0]?.id ?? null,
      startedAt: Date.now() - 42000,
      submittedAt: Date.now(),
      durationMs: 42000,
    }),
    test: true,
  };
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json", "user-agent": "Formloom-Webhook/1.0" };
  if (def.settings.webhookSecret)
    headers["x-formloom-signature"] = `sha256=${crypto.createHmac("sha256", def.settings.webhookSecret).update(body).digest("hex")}`;
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(8000) });
    await logWebhook(formId, "r_test", url, res.status, res.ok ? null : `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, error: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed";
    await logWebhook(formId, "r_test", url, null, msg);
    return { ok: false, error: msg };
  }
}

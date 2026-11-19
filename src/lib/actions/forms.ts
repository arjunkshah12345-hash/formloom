"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, sha256 } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createForm,
  deleteForm,
  deleteResponses,
  duplicateForm,
  getForm,
  patchSettings,
  publishForm,
  saveDraft,
  unpublishForm,
} from "@/lib/forms";
import { normalizeDefinition, uid, type FormDefinition } from "@/lib/schema";
import { TEMPLATES } from "@/lib/templates";

export async function createFromTemplate(templateKey: string) {
  const user = await requireUser();
  const template = TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0];
  const id = createForm(user.id, template.build());
  redirect(`/forms/${id}/edit`);
}

export async function importForm(json: string): Promise<{ error?: string }> {
  const user = await requireUser();
  let parsed: Partial<FormDefinition>;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { error: "That file isn't valid JSON." };
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.fields)) {
    return { error: "This doesn't look like a Formloom form export." };
  }
  const id = createForm(user.id, normalizeDefinition(parsed));
  redirect(`/forms/${id}/edit`);
}

export async function saveFormDraft(id: string, def: FormDefinition) {
  const user = await requireUser();
  const clean = normalizeDefinition(def);
  const updatedAt = saveDraft(id, user.id, clean);
  return { updatedAt };
}

export async function publish(id: string, def?: FormDefinition) {
  const user = await requireUser();
  if (def) saveDraft(id, user.id, normalizeDefinition(def));
  const form = getForm(id, user.id);
  if (!form) return { error: "Form not found" };
  if (!form.draft.fields.length) return { error: "Add at least one question before publishing." };
  publishForm(id, user.id);
  revalidatePath(`/forms`);
  return { ok: true, slug: form.slug };
}

export async function unpublish(id: string) {
  const user = await requireUser();
  unpublishForm(id, user.id);
  revalidatePath(`/forms`);
}

export async function setClosed(id: string, isClosed: boolean) {
  const user = await requireUser();
  patchSettings(id, user.id, { isClosed });
  revalidatePath(`/forms`);
}

export async function removeForm(id: string) {
  const user = await requireUser();
  deleteForm(id, user.id);
  revalidatePath("/forms");
}

export async function duplicate(id: string) {
  const user = await requireUser();
  duplicateForm(id, user.id);
  revalidatePath("/forms");
}

export async function removeResponses(formId: string, ids: string[]) {
  const user = await requireUser();
  if (!getForm(formId, user.id)) return;
  deleteResponses(formId, ids);
  revalidatePath(`/forms/${formId}/results`);
}

// API keys --------------------------------------------------------------------

export async function createApiKey(name: string) {
  const user = await requireUser();
  const token = `fl_${crypto.randomBytes(24).toString("base64url")}`;
  db()
    .prepare(
      "INSERT INTO api_keys (id, user_id, name, token_hash, preview, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(uid("key"), user.id, name.trim() || "API key", sha256(token), `${token.slice(0, 7)}…${token.slice(-4)}`, Date.now());
  revalidatePath("/account");
  return { token };
}

export async function revokeApiKey(id: string) {
  const user = await requireUser();
  db().prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/account");
}

import { countResponses, createForm, getForm, listForms, listResponses, publishForm } from "./forms";
import { createField, FIELD_META, normalizeDefinition, uid, type FieldType, type FormDefinition } from "./schema";
import { TEMPLATES } from "./templates";
import { responsePayload } from "./webhooks";

/**
 * The simple form spec agents send to the REST API and the MCP server. Kept flat so a model can
 * write it from a one-line request without knowing the full FormDefinition.
 */
export type QuestionSpec = {
  type: FieldType;
  title: string;
  description?: string;
  required?: boolean;
  /** For multiple_choice, dropdown and picture_choice. */
  choices?: string[];
  allowMultiple?: boolean;
  placeholder?: string;
};

export type FormSpec = {
  title: string;
  description?: string;
  /** Start from a template instead of writing questions: see listTemplates(). */
  template?: string;
  questions?: QuestionSpec[];
  ending?: { title: string; description?: string; redirectUrl?: string };
  webhookUrl?: string;
  publish?: boolean;
};

export const FIELD_TYPES = Object.keys(FIELD_META) as FieldType[];

export class SpecError extends Error {}

export function listTemplates() {
  return TEMPLATES.map((t) => ({ key: t.key, name: t.name, description: t.description }));
}

export function buildDefinition(spec: FormSpec): FormDefinition {
  if (!spec || typeof spec.title !== "string" || !spec.title.trim()) throw new SpecError("`title` is required.");
  let def: FormDefinition;
  if (spec.template) {
    const t = TEMPLATES.find((x) => x.key === spec.template);
    if (!t) throw new SpecError(`Unknown template "${spec.template}". Use one of: ${TEMPLATES.map((x) => x.key).join(", ")}.`);
    def = t.build();
  } else {
    const qs = spec.questions ?? [];
    if (!Array.isArray(qs) || !qs.length) throw new SpecError("Send `questions` (at least one) or a `template`.");
    if (qs.length > 100) throw new SpecError("At most 100 questions.");
    def = normalizeDefinition({
      fields: qs.map((q, i) => {
        if (!FIELD_TYPES.includes(q?.type)) throw new SpecError(`questions[${i}].type must be one of: ${FIELD_TYPES.join(", ")}.`);
        if (typeof q.title !== "string" || !q.title.trim()) throw new SpecError(`questions[${i}].title is required.`);
        const f = createField(q.type);
        const choiceTypes: FieldType[] = ["multiple_choice", "dropdown", "picture_choice"];
        if (choiceTypes.includes(q.type) && !(q.choices?.length)) throw new SpecError(`questions[${i}] needs \`choices\`.`);
        return {
          ...f,
          id: uid("f"),
          title: q.title.trim(),
          description: q.description,
          required: q.required ?? f.required,
          properties: {
            ...f.properties,
            ...(q.choices?.length ? { choices: q.choices.map((label) => ({ id: uid("c"), label: String(label) })) } : {}),
            ...(q.allowMultiple !== undefined ? { allowMultiple: q.allowMultiple } : {}),
            ...(q.placeholder ? { placeholder: q.placeholder } : {}),
          },
        };
      }),
    });
  }
  def.title = spec.title.trim();
  if (spec.description) def.welcome = { ...def.welcome, enabled: true, title: def.title, description: spec.description };
  else if (!spec.template) def.welcome = { ...def.welcome, enabled: false, title: def.title, description: undefined };
  if (spec.ending) def.endings = [{ ...def.endings[0], id: def.endings[0]?.id ?? uid("end"), ...spec.ending }];
  if (spec.webhookUrl) {
    if (!/^https:\/\//.test(spec.webhookUrl)) throw new SpecError("`webhookUrl` must be https.");
    def.settings = { ...def.settings, webhookUrl: spec.webhookUrl };
  }
  return def;
}

const iso = (ms: number | null | undefined) => (ms ? new Date(ms).toISOString() : null);

export async function apiListForms(userId: string) {
  return (await listForms(userId)).map((f) => ({
    id: f.id,
    slug: f.slug,
    title: f.title,
    published: f.isPublished,
    closed: f.isClosed,
    responses: f.responseCount,
    lastResponseAt: iso(f.lastResponseAt),
    updatedAt: iso(f.updatedAt),
  }));
}

export async function apiCreateForm(userId: string, spec: FormSpec, base: string) {
  const id = await createForm(userId, buildDefinition(spec));
  if (spec.publish) await publishForm(id, userId);
  const form = (await getForm(id, userId))!;
  return {
    id,
    slug: form.slug,
    title: form.draft.title,
    published: Boolean(spec.publish),
    url: `${base}/f/${form.slug}`,
    editUrl: `${base}/forms/${id}/edit`,
    embed: `<iframe src="${base}/f/${form.slug}?embed=1" width="100%" height="600" style="border:0" title="${form.draft.title.replace(/"/g, "&quot;")}"></iframe>`,
  };
}

export async function apiPublishForm(userId: string, id: string, base: string) {
  const form = await getForm(id, userId);
  if (!form) return null;
  await publishForm(id, userId);
  return { id, published: true, url: `${base}/f/${form.slug}` };
}

export async function apiGetForm(userId: string, id: string, base: string) {
  const form = await getForm(id, userId);
  if (!form) return null;
  return { id: form.id, slug: form.slug, url: `${base}/f/${form.slug}`, draft: form.draft, published: form.published };
}

export async function apiListResponses(userId: string, id: string, opts: { limit?: number; offset?: number; since?: number }) {
  const form = await getForm(id, userId);
  if (!form) return null;
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 1000);
  const offset = Math.max(Number(opts.offset) || 0, 0);
  const rows = await listResponses(form.id, { limit, offset, since: Number(opts.since) || 0 });
  return {
    total: await countResponses(form.id),
    limit,
    offset,
    data: rows.map((r) => responsePayload(form.id, form.published ?? form.draft, r).response),
  };
}

import "server-only";
import { db } from "./db";
import { normalizeDefinition, uid, type Answers, type FormDefinition } from "./schema";

export type FormRow = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  draft: FormDefinition;
  published: FormDefinition | null;
  publishedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type FormListItem = {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  hasChanges: boolean;
  isClosed: boolean;
  updatedAt: number;
  responseCount: number;
  lastResponseAt: number | null;
  theme: FormDefinition["theme"];
  fieldCount: number;
};

type RawForm = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  draft: string;
  published: string | null;
  published_at: number | null;
  created_at: number;
  updated_at: number;
};

function toRow(r: RawForm): FormRow {
  return {
    id: r.id,
    userId: r.user_id,
    slug: r.slug,
    title: r.title,
    draft: normalizeDefinition(JSON.parse(r.draft)),
    published: r.published ? normalizeDefinition(JSON.parse(r.published)) : null,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function newSlug() {
  return uid().slice(0, 8);
}

export async function listForms(userId: string): Promise<FormListItem[]> {
  const rows = await (await db()).all<RawForm & { response_count: number; last_response_at: number | null }>(
    `SELECT f.*, COUNT(r.id) AS response_count, MAX(r.submitted_at) AS last_response_at
     FROM forms f LEFT JOIN responses r ON r.form_id = f.id AND r.locked = 0
     WHERE f.user_id = ? GROUP BY f.id ORDER BY f.updated_at DESC`,
    userId,
  );
  return rows.map((r) => {
    const draft = normalizeDefinition(JSON.parse(r.draft));
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      isPublished: Boolean(r.published),
      hasChanges: r.published !== null && r.published !== r.draft,
      isClosed: draft.settings.isClosed,
      updatedAt: r.updated_at,
      responseCount: r.response_count,
      lastResponseAt: r.last_response_at,
      theme: draft.theme,
      fieldCount: draft.fields.length,
    };
  });
}

export async function getForm(id: string, userId: string): Promise<FormRow | null> {
  const r = await (await db()).get<RawForm>("SELECT * FROM forms WHERE id = ? AND user_id = ?", id, userId);
  return r ? toRow(r) : null;
}

export async function getFormBySlug(slug: string): Promise<FormRow | null> {
  const r = await (await db()).get<RawForm>("SELECT * FROM forms WHERE slug = ?", slug);
  return r ? toRow(r) : null;
}

export async function getFormById(id: string): Promise<FormRow | null> {
  const r = await (await db()).get<RawForm>("SELECT * FROM forms WHERE id = ?", id);
  return r ? toRow(r) : null;
}

export async function createForm(userId: string, def: FormDefinition): Promise<string> {
  const id = uid("form");
  const now = Date.now();
  await (await db()).run(
    `INSERT INTO forms (id, user_id, slug, title, draft, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    newSlug(),
    def.title,
    JSON.stringify(def),
    now,
    now,
  );
  return id;
}

export async function saveDraft(id: string, userId: string, def: FormDefinition): Promise<number> {
  const now = Date.now();
  const res = await (await db()).run(
    "UPDATE forms SET draft = ?, title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    JSON.stringify(def),
    def.title.trim() || "Untitled form",
    now,
    id,
    userId,
  );
  if (!res.changes) throw new Error("Form not found");
  return now;
}

export async function publishForm(id: string, userId: string) {
  const now = Date.now();
  await (await db()).run(
    "UPDATE forms SET published = draft, published_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    now,
    now,
    id,
    userId,
  );
}

export async function unpublishForm(id: string, userId: string) {
  await (await db()).run(
    "UPDATE forms SET published = NULL, published_at = NULL WHERE id = ? AND user_id = ?",
    id,
    userId,
  );
}

export async function deleteForm(id: string, userId: string) {
  await (await db()).run("DELETE FROM forms WHERE id = ? AND user_id = ?", id, userId);
}

export async function duplicateForm(id: string, userId: string): Promise<string | null> {
  const form = await getForm(id, userId);
  if (!form) return null;
  return createForm(userId, { ...form.draft, title: `${form.draft.title} (copy)` });
}

/** Update a single setting on both draft and published versions (e.g. open/close). */
export async function patchSettings(id: string, userId: string, patch: Partial<FormDefinition["settings"]>) {
  const form = await getForm(id, userId);
  if (!form) return;
  const apply = (d: FormDefinition) => ({ ...d, settings: { ...d.settings, ...patch } });
  const draftJson = JSON.stringify(apply(form.draft));
  const wasInSync = form.published && JSON.stringify(form.published) === JSON.stringify(form.draft);
  await (await db()).run(
    "UPDATE forms SET draft = ?, published = ?, updated_at = ? WHERE id = ?",
    draftJson,
    form.published ? (wasInSync ? draftJson : JSON.stringify(apply(form.published))) : null,
    Date.now(),
    id,
  );
}

// ---------------------------------------------------------------------------
// Responses

export type ResponseRow = {
  id: string;
  answers: Answers;
  hidden: Record<string, string>;
  meta: { userAgent?: string; referrer?: string; device?: string };
  endingId: string | null;
  startedAt: number | null;
  submittedAt: number;
  durationMs: number | null;
};

type RawResponse = {
  id: string;
  answers: string;
  hidden: string;
  meta: string;
  ending_id: string | null;
  started_at: number | null;
  submitted_at: number;
  duration_ms: number | null;
};

const toResponse = (r: RawResponse): ResponseRow => ({
  id: r.id,
  answers: JSON.parse(r.answers),
  hidden: JSON.parse(r.hidden),
  meta: JSON.parse(r.meta),
  endingId: r.ending_id,
  startedAt: r.started_at,
  submittedAt: r.submitted_at,
  durationMs: r.duration_ms,
});

export async function insertResponse(
  formId: string,
  data: Omit<ResponseRow, "id" | "submittedAt">,
  /** Held past the free plan's monthly allowance; shown once the owner upgrades. */
  locked = false,
): Promise<ResponseRow> {
  const row: ResponseRow = { ...data, id: uid("r"), submittedAt: Date.now() };
  await (await db()).run(
      `INSERT INTO responses (id, form_id, answers, hidden, meta, ending_id, started_at, submitted_at, duration_ms, locked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id,
      formId,
      JSON.stringify(row.answers),
      JSON.stringify(row.hidden),
      JSON.stringify(row.meta),
      row.endingId,
      row.startedAt,
      row.submittedAt,
      row.durationMs,
      locked ? 1 : 0,
  );
  return row;
}

export async function listResponses(
  formId: string,
  opts: { limit?: number; offset?: number; since?: number } = {},
) {
  const rows = await (await db()).all<RawResponse>(
    `SELECT * FROM responses WHERE form_id = ? AND locked = 0 AND submitted_at >= ?
     ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
    formId,
    opts.since ?? 0,
    opts.limit ?? 10000,
    opts.offset ?? 0,
  );
  return rows.map(toResponse);
}

/** Visible responses; pass `includeLocked` to count everything the form has received. */
export async function countResponses(formId: string, includeLocked = false): Promise<number> {
  const r = await (await db()).get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM responses WHERE form_id = ?${includeLocked ? "" : " AND locked = 0"}`,
    formId,
  );
  return r?.n ?? 0;
}

export async function lockedCount(formId: string): Promise<number> {
  const r = await (await db()).get<{ n: number }>(
    "SELECT COUNT(*) AS n FROM responses WHERE form_id = ? AND locked = 1",
    formId,
  );
  return r?.n ?? 0;
}

export async function deleteResponses(formId: string, ids: string[]) {
  await (await db()).batch(
    ids.map((id) => ["DELETE FROM responses WHERE form_id = ? AND id = ?", [formId, id]]),
  );
}

// ---------------------------------------------------------------------------
// Analytics events (deduplicated per visitor)

export type EventType = "view" | "start" | "reach";

export async function recordEvent(formId: string, visitor: string, type: EventType, fieldId = "") {
  await (await db()).run(
    `INSERT OR IGNORE INTO events (form_id, visitor, type, field_id, created_at) VALUES (?, ?, ?, ?, ?)`,
    formId,
    visitor.slice(0, 64),
    type,
    fieldId.slice(0, 64),
    Date.now(),
  );
}

export async function formStats(formId: string, since = 0) {
  const d = await db();
  const count = async (type: EventType) =>
    (
      await d.get<{ n: number }>(
        "SELECT COUNT(*) AS n FROM events WHERE form_id = ? AND type = ? AND created_at >= ?",
        formId,
        type,
        since,
      )
    )?.n ?? 0;
  const [views, starts, reach, sub] = await Promise.all([
    count("view"),
    count("start"),
    d.all<{ field_id: string; n: number }>(
      `SELECT field_id, COUNT(*) AS n FROM events WHERE form_id = ? AND type = 'reach' AND created_at >= ?
       GROUP BY field_id`,
      formId,
      since,
    ),
    d.get<{ n: number; avg: number | null }>(
      `SELECT COUNT(*) AS n, AVG(duration_ms) AS avg FROM responses WHERE form_id = ? AND locked = 0 AND submitted_at >= ?`,
      formId,
      since,
    ),
  ]);
  return {
    views,
    starts,
    submissions: sub?.n ?? 0,
    avgDurationMs: sub?.avg ?? null,
    reach: Object.fromEntries(reach.map((r) => [r.field_id, r.n])) as Record<string, number>,
  };
}

// ---------------------------------------------------------------------------
// Webhook delivery log

export async function logWebhook(
  formId: string,
  responseId: string,
  url: string,
  status: number | null,
  error: string | null,
) {
  await (await db()).run(
    `INSERT INTO webhook_deliveries (id, form_id, response_id, url, status, error, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    uid("wh"),
    formId,
    responseId,
    url,
    status,
    error,
    Date.now(),
  );
}

export async function recentWebhooks(formId: string) {
  return (await db()).all<{
    id: string;
    responseId: string;
    url: string;
    status: number | null;
    error: string | null;
    createdAt: number;
  }>(
    `SELECT id, response_id AS responseId, url, status, error, created_at AS createdAt
     FROM webhook_deliveries WHERE form_id = ? ORDER BY created_at DESC LIMIT 10`,
    formId,
  );
}

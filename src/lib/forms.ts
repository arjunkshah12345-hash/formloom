import "server-only";
import { db, tx } from "./db";
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

export function listForms(userId: string): FormListItem[] {
  const rows = db()
    .prepare(
      `SELECT f.*, COUNT(r.id) AS response_count, MAX(r.submitted_at) AS last_response_at
       FROM forms f LEFT JOIN responses r ON r.form_id = f.id
       WHERE f.user_id = ? GROUP BY f.id ORDER BY f.updated_at DESC`,
    )
    .all(userId) as unknown as (RawForm & { response_count: number; last_response_at: number | null })[];
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

export function getForm(id: string, userId: string): FormRow | null {
  const r = db().prepare("SELECT * FROM forms WHERE id = ? AND user_id = ?").get(id, userId) as
    | RawForm
    | undefined;
  return r ? toRow(r) : null;
}

export function getFormBySlug(slug: string): FormRow | null {
  const r = db().prepare("SELECT * FROM forms WHERE slug = ?").get(slug) as RawForm | undefined;
  return r ? toRow(r) : null;
}

export function getFormById(id: string): FormRow | null {
  const r = db().prepare("SELECT * FROM forms WHERE id = ?").get(id) as RawForm | undefined;
  return r ? toRow(r) : null;
}

export function createForm(userId: string, def: FormDefinition): string {
  const id = uid("form");
  const now = Date.now();
  db()
    .prepare(
      `INSERT INTO forms (id, user_id, slug, title, draft, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, userId, newSlug(), def.title, JSON.stringify(def), now, now);
  return id;
}

export function saveDraft(id: string, userId: string, def: FormDefinition): number {
  const now = Date.now();
  const res = db()
    .prepare("UPDATE forms SET draft = ?, title = ?, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(JSON.stringify(def), def.title.trim() || "Untitled form", now, id, userId);
  if (!res.changes) throw new Error("Form not found");
  return now;
}

export function publishForm(id: string, userId: string) {
  const now = Date.now();
  db()
    .prepare(
      "UPDATE forms SET published = draft, published_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    )
    .run(now, now, id, userId);
}

export function unpublishForm(id: string, userId: string) {
  db()
    .prepare("UPDATE forms SET published = NULL, published_at = NULL WHERE id = ? AND user_id = ?")
    .run(id, userId);
}

export function deleteForm(id: string, userId: string) {
  db().prepare("DELETE FROM forms WHERE id = ? AND user_id = ?").run(id, userId);
}

export function duplicateForm(id: string, userId: string): string | null {
  const form = getForm(id, userId);
  if (!form) return null;
  return createForm(userId, { ...form.draft, title: `${form.draft.title} (copy)` });
}

/** Update a single setting on both draft and published versions (e.g. open/close). */
export function patchSettings(id: string, userId: string, patch: Partial<FormDefinition["settings"]>) {
  const form = getForm(id, userId);
  if (!form) return;
  const apply = (d: FormDefinition) => ({ ...d, settings: { ...d.settings, ...patch } });
  const draftJson = JSON.stringify(apply(form.draft));
  const wasInSync = form.published && JSON.stringify(form.published) === JSON.stringify(form.draft);
  db()
    .prepare("UPDATE forms SET draft = ?, published = ?, updated_at = ? WHERE id = ?")
    .run(
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

export function insertResponse(
  formId: string,
  data: Omit<ResponseRow, "id" | "submittedAt">,
): ResponseRow {
  const row: ResponseRow = { ...data, id: uid("r"), submittedAt: Date.now() };
  db()
    .prepare(
      `INSERT INTO responses (id, form_id, answers, hidden, meta, ending_id, started_at, submitted_at, duration_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      formId,
      JSON.stringify(row.answers),
      JSON.stringify(row.hidden),
      JSON.stringify(row.meta),
      row.endingId,
      row.startedAt,
      row.submittedAt,
      row.durationMs,
    );
  return row;
}

export function listResponses(formId: string, opts: { limit?: number; offset?: number; since?: number } = {}) {
  const rows = db()
    .prepare(
      `SELECT * FROM responses WHERE form_id = ? AND submitted_at >= ?
       ORDER BY submitted_at DESC LIMIT ? OFFSET ?`,
    )
    .all(formId, opts.since ?? 0, opts.limit ?? 10000, opts.offset ?? 0) as unknown as RawResponse[];
  return rows.map(toResponse);
}

export function countResponses(formId: string): number {
  return (
    db().prepare("SELECT COUNT(*) AS n FROM responses WHERE form_id = ?").get(formId) as { n: number }
  ).n;
}

export function deleteResponses(formId: string, ids: string[]) {
  tx(() => {
    const stmt = db().prepare("DELETE FROM responses WHERE form_id = ? AND id = ?");
    for (const id of ids) stmt.run(formId, id);
  });
}

// ---------------------------------------------------------------------------
// Analytics events (deduplicated per visitor)

export type EventType = "view" | "start" | "reach";

export function recordEvent(formId: string, visitor: string, type: EventType, fieldId = "") {
  db()
    .prepare(
      `INSERT OR IGNORE INTO events (form_id, visitor, type, field_id, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(formId, visitor.slice(0, 64), type, fieldId.slice(0, 64), Date.now());
}

export function formStats(formId: string, since = 0) {
  const d = db();
  const count = (type: EventType) =>
    (
      d
        .prepare(
          "SELECT COUNT(*) AS n FROM events WHERE form_id = ? AND type = ? AND created_at >= ?",
        )
        .get(formId, type, since) as { n: number }
    ).n;
  const reach = d
    .prepare(
      `SELECT field_id, COUNT(*) AS n FROM events WHERE form_id = ? AND type = 'reach' AND created_at >= ?
       GROUP BY field_id`,
    )
    .all(formId, since) as { field_id: string; n: number }[];
  const sub = d
    .prepare(
      `SELECT COUNT(*) AS n, AVG(duration_ms) AS avg FROM responses WHERE form_id = ? AND submitted_at >= ?`,
    )
    .get(formId, since) as { n: number; avg: number | null };
  return {
    views: count("view"),
    starts: count("start"),
    submissions: sub.n,
    avgDurationMs: sub.avg,
    reach: Object.fromEntries(reach.map((r) => [r.field_id, r.n])) as Record<string, number>,
  };
}

// ---------------------------------------------------------------------------
// Webhook delivery log

export function logWebhook(formId: string, responseId: string, url: string, status: number | null, error: string | null) {
  db()
    .prepare(
      `INSERT INTO webhook_deliveries (id, form_id, response_id, url, status, error, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(uid("wh"), formId, responseId, url, status, error, Date.now());
}

export function recentWebhooks(formId: string) {
  return db()
    .prepare(
      `SELECT id, response_id AS responseId, url, status, error, created_at AS createdAt
       FROM webhook_deliveries WHERE form_id = ? ORDER BY created_at DESC LIMIT 10`,
    )
    .all(formId) as {
    id: string;
    responseId: string;
    url: string;
    status: number | null;
    error: string | null;
    createdAt: number;
  }[];
}

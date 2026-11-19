// Pure form logic: validation, branching, recall. Runs in the browser and on the server.
import type { AnswerValue, Answers, Condition, Field, FormDefinition, LogicRule } from "./schema";

export const OTHER_PREFIX = "other:";

export function isEmpty(v: AnswerValue | undefined): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;
const PHONE_RE = /^\+?[\d\s().-]{6,20}$/;

/** Returns an error message, or null when the answer is acceptable. */
export function validateAnswer(field: Field, value: AnswerValue | undefined): string | null {
  if (field.type === "statement") return null;
  if (isEmpty(value)) {
    if (field.type === "legal" && field.required) return "Please accept to continue";
    return field.required ? "Please fill this in" : null;
  }
  const p = field.properties;
  switch (field.type) {
    case "email":
      return EMAIL_RE.test(String(value).trim()) ? null : "Hmm, that email doesn't look right";
    case "url":
      return URL_RE.test(String(value).trim()) ? null : "Please enter a valid URL";
    case "phone":
      return PHONE_RE.test(String(value).trim()) ? null : "Please enter a valid phone number";
    case "number": {
      const n = Number(value);
      if (!Number.isFinite(n)) return "Numbers only please";
      if (p.min !== undefined && n < p.min) return `Must be ${p.min} or more`;
      if (p.max !== undefined && n > p.max) return `Must be ${p.max} or less`;
      return null;
    }
    case "short_text":
    case "long_text":
      if (p.maxLength && String(value).length > p.maxLength)
        return `Max ${p.maxLength} characters`;
      return null;
    case "multiple_choice":
    case "picture_choice": {
      const arr = Array.isArray(value) ? value : [String(value)];
      if (arr.some((x) => x === OTHER_PREFIX)) return "Please describe your other option";
      if (p.allowMultiple) {
        if (p.minSelections && arr.length < p.minSelections)
          return `Choose at least ${p.minSelections}`;
        if (p.maxSelections && arr.length > p.maxSelections)
          return `Choose at most ${p.maxSelections}`;
      }
      return null;
    }
    case "date": {
      const s = String(value);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "Please enter a complete date";
      const d = new Date(s + "T00:00:00Z");
      if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s)
        return "That date doesn't exist";
      return null;
    }
    case "legal":
      if (field.required && value !== true) return "Please accept to continue";
      return null;
    default:
      return null;
  }
}

/** Human-readable text for any answer. */
export function formatAnswer(field: Field | undefined, value: AnswerValue | undefined): string {
  if (isEmpty(value)) return "";
  if (!field) return Array.isArray(value) ? value.join(", ") : String(value);
  const labelOf = (id: string) => {
    if (id.startsWith(OTHER_PREFIX)) return id.slice(OTHER_PREFIX.length);
    return field.properties.choices?.find((c) => c.id === id)?.label ?? id;
  };
  switch (field.type) {
    case "multiple_choice":
    case "picture_choice":
    case "dropdown": {
      const arr = Array.isArray(value) ? value : [String(value)];
      return arr.map(labelOf).join(", ");
    }
    case "yes_no":
      return value === true || value === "yes" ? "Yes" : "No";
    case "legal":
      return value === true ? "Accepted" : "Not accepted";
    case "date": {
      const [y, m, d] = String(value).split("-");
      const fmt = field.properties.dateFormat ?? "MDY";
      if (fmt === "DMY") return `${d}/${m}/${y}`;
      if (fmt === "YMD") return `${y}/${m}/${d}`;
      return `${m}/${d}/${y}`;
    }
    default:
      return String(value);
  }
}

function compare(field: Field | undefined, value: AnswerValue | undefined, c: Condition): boolean {
  const empty = isEmpty(value);
  if (c.op === "answered") return !empty;
  if (c.op === "not_answered") return empty;
  if (empty) return c.op === "is_not" || c.op === "not_contains";

  const target = (c.value ?? "").trim().toLowerCase();
  // Choice answers compare by choice id, falling back to label text.
  const values: string[] = Array.isArray(value)
    ? value.map((v) => String(v).toLowerCase())
    : typeof value === "boolean"
      ? [value ? "yes" : "no", String(value)]
      : [String(value).toLowerCase()];
  if (field && field.properties.choices) {
    for (const v of [...values]) {
      const choice = field.properties.choices.find((ch) => ch.id.toLowerCase() === v);
      if (choice) values.push(choice.label.toLowerCase());
    }
  }

  switch (c.op) {
    case "is":
      return values.includes(target);
    case "is_not":
      return !values.includes(target);
    case "contains":
      return values.some((v) => v.includes(target));
    case "not_contains":
      return !values.some((v) => v.includes(target));
    case "gt":
      return Number(value) > Number(c.value);
    case "lt":
      return Number(value) < Number(c.value);
    default:
      return false;
  }
}

export function ruleMatches(rule: LogicRule, def: FormDefinition, answers: Answers): boolean {
  if (!rule.conditions.length) return false;
  const results = rule.conditions.map((c) => {
    const field = def.fields.find((f) => f.id === c.fieldId);
    return compare(field, answers[c.fieldId], c);
  });
  return rule.combinator === "or" ? results.some(Boolean) : results.every(Boolean);
}

export type Step = { kind: "field"; id: string } | { kind: "ending"; id: string };

/** Decide where to go after answering `fieldId`. */
export function nextStep(def: FormDefinition, fieldId: string, answers: Answers): Step {
  const idx = def.fields.findIndex((f) => f.id === fieldId);
  const field = def.fields[idx];
  const resolve = (to: string): Step | null => {
    if (def.fields.some((f) => f.id === to)) return { kind: "field", id: to };
    if (def.endings.some((e) => e.id === to)) return { kind: "ending", id: to };
    return null;
  };
  if (field) {
    for (const rule of field.logic ?? []) {
      if (ruleMatches(rule, def, answers)) {
        const s = resolve(rule.to);
        if (s) return s;
      }
    }
    if (field.fallbackTo) {
      const s = resolve(field.fallbackTo);
      if (s) return s;
    }
  }
  const next = def.fields[idx + 1];
  if (next) return { kind: "field", id: next.id };
  return { kind: "ending", id: def.endings[0]?.id ?? "default" };
}

const RECALL_RE = /\{\{(field|hidden):([\w-]+)\}\}/g;

/** Replace {{field:id}} / {{hidden:name}} tokens with answers. */
export function recall(
  text: string,
  def: FormDefinition,
  answers: Answers,
  hidden: Record<string, string>,
  placeholder = "…",
): string {
  return text.replace(RECALL_RE, (_, kind: string, key: string) => {
    if (kind === "hidden") return hidden[key] || placeholder;
    const field = def.fields.find((f) => f.id === key);
    const out = formatAnswer(field, answers[key]);
    return out || placeholder;
  });
}

/** Turn recall tokens into readable pills for the builder (e.g. "@Name"). */
export function recallLabels(text: string, def: FormDefinition): string {
  return text.replace(RECALL_RE, (_, kind: string, key: string) => {
    if (kind === "hidden") return `@${key}`;
    const field = def.fields.find((f) => f.id === key);
    return field ? `@${truncate(stripTokens(field.title), 24)}` : "@deleted";
  });
}

export function stripTokens(text: string) {
  return text.replace(RECALL_RE, "…");
}

export function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

/** Clean a submitted answer set: drop unknown fields, coerce types, enforce validation. */
export function sanitizeAnswers(
  def: FormDefinition,
  raw: Record<string, unknown>,
): { answers: Answers; errors: Record<string, string> } {
  const answers: Answers = {};
  const errors: Record<string, string> = {};
  for (const field of def.fields) {
    if (field.type === "statement") continue;
    const v = raw[field.id];
    if (v === undefined || v === null) continue;
    let clean: AnswerValue;
    if (Array.isArray(v)) clean = v.map((x) => String(x).slice(0, 2000)).slice(0, 100);
    else if (typeof v === "boolean") clean = v;
    else if (typeof v === "number") clean = Number.isFinite(v) ? v : null;
    else clean = String(v).slice(0, 10000);
    if (isEmpty(clean)) continue;
    const err = validateAnswer(field, clean);
    if (err) errors[field.id] = err;
    else if (["number", "rating", "opinion_scale", "nps"].includes(field.type)) answers[field.id] = Number(clean);
    else if (field.type === "yes_no" || field.type === "legal") answers[field.id] = clean === true || clean === "true";
    else answers[field.id] = clean;
  }
  return { answers, errors };
}

/** Walk the form using answers to find which fields the respondent should have seen. */
export function visiblePath(def: FormDefinition, answers: Answers): string[] {
  const path: string[] = [];
  if (!def.fields.length) return path;
  let cur: Step = { kind: "field", id: def.fields[0].id };
  const guard = new Set<string>();
  while (cur.kind === "field" && !guard.has(cur.id)) {
    guard.add(cur.id);
    path.push(cur.id);
    cur = nextStep(def, cur.id, answers);
  }
  return path;
}

export function npsScore(values: number[]) {
  if (!values.length) return null;
  const promoters = values.filter((v) => v >= 9).length;
  const detractors = values.filter((v) => v <= 6).length;
  return {
    score: Math.round(((promoters - detractors) / values.length) * 100),
    promoters,
    passives: values.length - promoters - detractors,
    detractors,
  };
}

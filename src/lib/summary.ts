import { OTHER_PREFIX, formatAnswer, isEmpty, npsScore } from "./engine";
import type { Field, FormDefinition } from "./schema";
import type { ResponseRow } from "./forms";

export type FieldSummary =
  | { kind: "choices"; field: Field; answered: number; rows: { label: string; count: number }[]; other: string[] }
  | { kind: "boolean"; field: Field; answered: number; yes: number; no: number }
  | { kind: "scale"; field: Field; answered: number; average: number | null; dist: { value: number; count: number }[] }
  | {
      kind: "nps";
      field: Field;
      answered: number;
      dist: { value: number; count: number }[];
      nps: ReturnType<typeof npsScore>;
    }
  | { kind: "number"; field: Field; answered: number; average: number | null; min: number | null; max: number | null }
  | { kind: "text"; field: Field; answered: number; latest: { text: string; at: number }[] };

export function summarize(def: FormDefinition, responses: ResponseRow[]): FieldSummary[] {
  return def.fields
    .filter((f) => f.type !== "statement")
    .map((field): FieldSummary => {
      const values = responses
        .map((r) => ({ v: r.answers[field.id], at: r.submittedAt }))
        .filter((x) => !isEmpty(x.v));
      const answered = values.length;
      switch (field.type) {
        case "multiple_choice":
        case "picture_choice":
        case "dropdown": {
          const counts = new Map<string, number>();
          const other: string[] = [];
          for (const { v } of values) {
            const arr = Array.isArray(v) ? v : [String(v)];
            for (const id of arr) {
              if (id.startsWith(OTHER_PREFIX)) {
                other.push(id.slice(OTHER_PREFIX.length));
                counts.set("__other", (counts.get("__other") ?? 0) + 1);
              } else counts.set(id, (counts.get(id) ?? 0) + 1);
            }
          }
          const rows = (field.properties.choices ?? []).map((c) => ({ label: c.label || "Untitled", count: counts.get(c.id) ?? 0 }));
          if (field.properties.allowOther) rows.push({ label: "Other", count: counts.get("__other") ?? 0 });
          return { kind: "choices", field, answered, rows, other: other.slice(0, 20) };
        }
        case "yes_no":
        case "legal": {
          const yes = values.filter(({ v }) => v === true || v === "yes").length;
          return { kind: "boolean", field, answered, yes, no: answered - yes };
        }
        case "rating":
        case "opinion_scale":
        case "nps": {
          const nums = values.map(({ v }) => Number(v)).filter(Number.isFinite);
          const start = field.type === "nps" ? 0 : field.type === "rating" ? 1 : (field.properties.start ?? 1);
          const steps = field.type === "nps" ? 11 : (field.properties.steps ?? (field.type === "rating" ? 5 : 10));
          const dist = Array.from({ length: steps }, (_, i) => ({
            value: start + i,
            count: nums.filter((n) => n === start + i).length,
          }));
          if (field.type === "nps") return { kind: "nps", field, answered, dist, nps: npsScore(nums) };
          return {
            kind: "scale",
            field,
            answered,
            average: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null,
            dist,
          };
        }
        case "number": {
          const nums = values.map(({ v }) => Number(v)).filter(Number.isFinite);
          return {
            kind: "number",
            field,
            answered,
            average: nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null,
            min: nums.length ? Math.min(...nums) : null,
            max: nums.length ? Math.max(...nums) : null,
          };
        }
        default:
          return {
            kind: "text",
            field,
            answered,
            latest: values.slice(0, 6).map(({ v, at }) => ({ text: formatAnswer(field, v), at })),
          };
      }
    });
}

function csvCell(s: string) {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(def: FormDefinition, responses: ResponseRow[]): string {
  const fields = def.fields.filter((f) => f.type !== "statement");
  const header = [
    "Response ID",
    "Submitted at",
    ...fields.map((f) => f.title.replace(/\{\{[^}]+\}\}/g, "…")),
    ...def.settings.hiddenFields,
    "Ending",
    "Duration (s)",
    "Device",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const r of responses) {
    const ending = def.endings.find((e) => e.id === r.endingId)?.title ?? "";
    lines.push(
      [
        r.id,
        new Date(r.submittedAt).toISOString(),
        ...fields.map((f) => formatAnswer(f, r.answers[f.id])),
        ...def.settings.hiddenFields.map((h) => r.hidden[h] ?? ""),
        ending,
        r.durationMs ? String(Math.round(r.durationMs / 1000)) : "",
        r.meta.device ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return "﻿" + lines.join("\r\n");
}

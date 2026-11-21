"use client";

import { GitBranch, Plus, Trash2, X } from "lucide-react";
import { stripTokens, truncate } from "@/lib/engine";
import { uid, type Condition, type ConditionOp, type Field, type FormDefinition, type LogicRule } from "@/lib/schema";
import { Segmented } from "@/components/ui";
import { updateField, type Selection } from "./ops";
import { Section } from "./QuestionPanel";
import { useWorkspace } from "./workspace";

const OP_LABEL: Record<ConditionOp, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  not_contains: "doesn't contain",
  gt: "is greater than",
  lt: "is lower than",
  answered: "is answered",
  not_answered: "is not answered",
};

function opsFor(field: Field | undefined): ConditionOp[] {
  if (!field) return ["is"];
  switch (field.type) {
    case "number":
    case "rating":
    case "opinion_scale":
    case "nps":
      return ["is", "is_not", "gt", "lt", "answered", "not_answered"];
    case "multiple_choice":
    case "picture_choice":
    case "dropdown":
    case "yes_no":
    case "legal":
      return ["is", "is_not", "answered", "not_answered"];
    case "date":
      return ["is", "is_not", "answered", "not_answered"];
    default:
      return ["is", "is_not", "contains", "not_contains", "answered", "not_answered"];
  }
}

function label(f: Field, def: FormDefinition) {
  const n = def.fields.indexOf(f) + 1;
  return `${n}. ${truncate(stripTokens(f.title) || "Untitled", 34)}`;
}

function ValueInput({ field, cond, onChange }: { field: Field | undefined; cond: Condition; onChange: (v: string) => void }) {
  if (cond.op === "answered" || cond.op === "not_answered") return null;
  if (!field) return null;
  if (field.properties.choices && ["multiple_choice", "picture_choice", "dropdown"].includes(field.type)) {
    return (
      <select className="input" value={cond.value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a choice…</option>
        {field.properties.choices.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label || "Untitled choice"}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "yes_no" || field.type === "legal") {
    return (
      <select className="input" value={cond.value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        <option value="yes">{field.type === "legal" ? "Accepted" : "Yes"}</option>
        <option value="no">{field.type === "legal" ? "Not accepted" : "No"}</option>
      </select>
    );
  }
  const numeric = ["number", "rating", "opinion_scale", "nps"].includes(field.type);
  return (
    <input
      className="input"
      type={numeric ? "number" : field.type === "date" ? "date" : "text"}
      value={cond.value ?? ""}
      placeholder="Value"
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function LogicPanel({ selection }: { selection: Selection }) {
  const { def, update } = useWorkspace();
  if (selection.kind !== "field") {
    return (
      <div className="px-5 py-10 text-center text-sm text-ink-3">
        <GitBranch className="mx-auto mb-3 size-6" />
        Select a question to add logic jumps.
      </div>
    );
  }
  const field = def.fields.find((f) => f.id === selection.id);
  if (!field) return null;
  const idx = def.fields.indexOf(field);
  const sources = def.fields.slice(0, idx + 1).filter((f) => f.type !== "statement");
  const targets = def.fields.slice(idx + 1);
  const rules = field.logic ?? [];

  const setRules = (fn: (r: LogicRule[]) => LogicRule[]) =>
    update((d) => updateField(d, field.id, (f) => ({ ...f, logic: fn(f.logic ?? []) })));
  const setRule = (id: string, fn: (r: LogicRule) => LogicRule) => setRules((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));

  const defaultSource = field.type !== "statement" ? field.id : sources[sources.length - 1]?.id;
  const newCondition = (): Condition => ({ fieldId: defaultSource ?? field.id, op: "is", value: "" });

  const targetSelect = (value: string | undefined, onChange: (v: string) => void, allowNext: boolean) => (
    <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {allowNext ? <option value="">Next question (default)</option> : <option value="">Select destination…</option>}
      {targets.length ? (
        <optgroup label="Questions">
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {label(t, def)}
            </option>
          ))}
        </optgroup>
      ) : null}
      <optgroup label="Endings">
        {def.endings.map((e, i) => (
          <option key={e.id} value={e.id}>
            {def.endings.length > 1 ? `Ending ${String.fromCharCode(65 + i)}: ` : "Ending: "}
            {truncate(e.title, 30)}
          </option>
        ))}
      </optgroup>
    </select>
  );

  return (
    <>
      <Section title="Logic jumps">
        <p className="text-xs leading-relaxed text-ink-3">
          After <b className="font-medium text-ink-2">{label(field, def)}</b>, send people to different places based on their answers.
          Rules are checked top to bottom.
        </p>
      </Section>

      {rules.map((rule, ri) => (
        <div key={rule.id} className="border-b border-line px-4 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Rule {ri + 1}</span>
            <button className="btn-ghost h-7 px-1.5 text-xs" onClick={() => setRules((rs) => rs.filter((r) => r.id !== rule.id))}>
              <Trash2 className="size-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {rule.conditions.map((c, ci) => {
              const src = def.fields.find((f) => f.id === c.fieldId);
              const ops = opsFor(src);
              const setCond = (patch: Partial<Condition>) =>
                setRule(rule.id, (r) => ({
                  ...r,
                  conditions: r.conditions.map((x, i) => (i === ci ? { ...x, ...patch } : x)),
                }));
              return (
                <div key={ci} className="space-y-1.5 rounded-lg bg-paper p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-ink-3 uppercase">
                      {ci === 0 ? "If" : rule.combinator === "and" ? "And" : "Or"}
                    </span>
                    {rule.conditions.length > 1 ? (
                      <button
                        className="text-ink-3 hover:text-ink"
                        onClick={() => setRule(rule.id, (r) => ({ ...r, conditions: r.conditions.filter((_, i) => i !== ci) }))}
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <select className="input" value={c.fieldId} onChange={(e) => setCond({ fieldId: e.target.value, value: "", op: "is" })}>
                    {sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {label(s, def)}
                      </option>
                    ))}
                  </select>
                  <select className="input" value={c.op} onChange={(e) => setCond({ op: e.target.value as ConditionOp })}>
                    {ops.map((o) => (
                      <option key={o} value={o}>
                        {OP_LABEL[o]}
                      </option>
                    ))}
                  </select>
                  <ValueInput field={src} cond={c} onChange={(value) => setCond({ value })} />
                </div>
              );
            })}
            <div className="flex items-center justify-between">
              <button
                className="btn-ghost h-7 px-2 text-xs"
                onClick={() => setRule(rule.id, (r) => ({ ...r, conditions: [...r.conditions, newCondition()] }))}
              >
                <Plus className="size-3.5" /> Condition
              </button>
              {rule.conditions.length > 1 ? (
                <Segmented
                  size="sm"
                  value={rule.combinator}
                  onChange={(combinator) => setRule(rule.id, (r) => ({ ...r, combinator }))}
                  options={[
                    { value: "and", label: "All match" },
                    { value: "or", label: "Any match" },
                  ]}
                />
              ) : null}
            </div>
            <div>
              <label className="label mt-1">Then jump to</label>
              {targetSelect(rule.to, (to) => setRule(rule.id, (r) => ({ ...r, to })), false)}
              {!rule.to ? <p className="mt-1 text-[11px] text-amber-300">Pick a destination or this rule is skipped.</p> : null}
            </div>
          </div>
        </div>
      ))}

      <div className="border-b border-line px-4 py-4">
        <button
          className="btn-outline w-full"
          onClick={() => setRules((rs) => [...rs, { id: uid("r"), combinator: "and", conditions: [newCondition()], to: "" }])}
        >
          <Plus className="size-4" /> Add rule
        </button>
      </div>

      <Section title={rules.length ? "In all other cases" : "Always go to"}>
        {targetSelect(field.fallbackTo, (v) => update((d) => updateField(d, field.id, (f) => ({ ...f, fallbackTo: v || undefined }))), true)}
      </Section>
    </>
  );
}

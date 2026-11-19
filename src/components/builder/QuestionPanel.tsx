"use client";

import { useRef, useState } from "react";
import { ChevronDown, ImagePlus, ListPlus, Trash2 } from "lucide-react";
import {
  FIELD_META,
  convertField,
  uid,
  type Attachment,
  type AttachmentLayout,
  type Ending,
  type Field,
  type FieldProperties,
} from "@/lib/schema";
import { Dialog, Segmented, Toggle } from "@/components/ui";
import { TypePicker } from "./AddQuestion";
import { TypeIcon } from "./TypeIcon";
import { updateEnding, updateField, type Selection } from "./ops";
import { uploadImage } from "./upload";
import { useWorkspace } from "./workspace";

export function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="border-b border-line px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wider text-ink-3 uppercase">{title}</h3>
        {aside}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      className="input"
      value={value ?? ""}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
    />
  );
}

export function QuestionPanel({ selection }: { selection: Selection }) {
  const { def, update } = useWorkspace();

  if (selection.kind === "welcome") {
    const w = def.welcome;
    return (
      <>
        <Section title="Welcome screen">
          <Toggle
            label="Show welcome screen"
            description="A friendly intro before the first question."
            checked={w.enabled}
            onChange={(enabled) => update((d) => ({ ...d, welcome: { ...d.welcome, enabled } }))}
          />
          <div>
            <label className="label">Button text</label>
            <input
              className="input"
              value={w.buttonText}
              onChange={(e) => update((d) => ({ ...d, welcome: { ...d.welcome, buttonText: e.target.value } }), { coalesce: "wbtn" })}
            />
          </div>
        </Section>
        <AttachmentEditor
          value={w.attachment}
          onChange={(attachment) => update((d) => ({ ...d, welcome: { ...d.welcome, attachment } }))}
        />
      </>
    );
  }

  if (selection.kind === "ending") {
    const ending = def.endings.find((e) => e.id === selection.id);
    if (!ending) return null;
    const set = (patch: Partial<Ending>, key: string) =>
      update((d) => updateEnding(d, ending.id, (e) => ({ ...e, ...patch })), { coalesce: `${ending.id}:${key}` });
    return (
      <>
        <Section title="Ending">
          <p className="text-xs leading-relaxed text-ink-3">
            {def.endings.length > 1
              ? "Respondents reach this ending through logic jumps. Without a jump, they see the first ending."
              : "Shown after the respondent submits."}
          </p>
          <div>
            <label className="label">Button text (optional)</label>
            <input className="input" value={ending.buttonText ?? ""} placeholder="e.g. Visit our site" onChange={(e) => set({ buttonText: e.target.value || undefined }, "bt")} />
          </div>
          <div>
            <label className="label">Button link</label>
            <input className="input" value={ending.buttonUrl ?? ""} placeholder="https://" onChange={(e) => set({ buttonUrl: e.target.value || undefined }, "bu")} />
          </div>
          <div>
            <label className="label">Redirect after submit</label>
            <input
              className="input"
              value={ending.redirectUrl ?? ""}
              placeholder="https:// (optional)"
              onChange={(e) => set({ redirectUrl: e.target.value || undefined }, "ru")}
            />
            <p className="mt-1 text-[11px] text-ink-3">Sends people to this URL 2.5s after they finish.</p>
          </div>
        </Section>
        <AttachmentEditor value={ending.attachment} onChange={(attachment) => set({ attachment }, "att")} />
      </>
    );
  }

  const field = def.fields.find((f) => f.id === selection.id);
  if (!field) return null;
  return <FieldSettings field={field} />;
}

function FieldSettings({ field }: { field: Field }) {
  const { update } = useWorkspace();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [typeEl, setTypeEl] = useState<HTMLButtonElement | null>(null);
  const set = (fn: (f: Field) => Field, key?: string) =>
    update((d) => updateField(d, field.id, fn), key ? { coalesce: `${field.id}:${key}` } : undefined);
  const prop = <K extends keyof FieldProperties>(k: K, v: FieldProperties[K]) =>
    set((f) => ({ ...f, properties: { ...f.properties, [k]: v } }), `p:${String(k)}`);
  const p = field.properties;
  const t = field.type;

  return (
    <>
      <Section title="Question">
        <div>
          <label className="label">Type</label>
          <button ref={setTypeEl} className="input flex items-center gap-2 text-left" onClick={() => setPickerOpen((o) => !o)}>
            <TypeIcon type={t} size="sm" />
            <span className="flex-1">{FIELD_META[t].label}</span>
            <ChevronDown className="size-4 text-ink-3" />
          </button>
          <TypePicker
            open={pickerOpen}
            anchor={typeEl}
            current={t}
            onClose={() => setPickerOpen(false)}
            onPick={(type) => type !== t && set((f) => convertField(f, type))}
          />
        </div>
        {t !== "statement" ? (
          <Toggle label="Required" checked={field.required} onChange={(required) => set((f) => ({ ...f, required }))} />
        ) : null}
      </Section>

      {["short_text", "long_text", "email", "phone", "url", "number"].includes(t) ? (
        <Section title="Input">
          <div>
            <label className="label">Placeholder</label>
            <input className="input" value={p.placeholder ?? ""} onChange={(e) => prop("placeholder", e.target.value)} />
          </div>
          {t === "short_text" || t === "long_text" ? (
            <div>
              <label className="label">Max characters</label>
              <NumberInput value={p.maxLength} min={1} placeholder="No limit" onChange={(v) => prop("maxLength", v)} />
            </div>
          ) : null}
          {t === "number" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Min</label>
                <NumberInput value={p.min} placeholder="None" onChange={(v) => prop("min", v)} />
              </div>
              <div>
                <label className="label">Max</label>
                <NumberInput value={p.max} placeholder="None" onChange={(v) => prop("max", v)} />
              </div>
            </div>
          ) : null}
        </Section>
      ) : null}

      {t === "multiple_choice" || t === "picture_choice" || t === "dropdown" ? (
        <Section
          title="Choices"
          aside={
            t !== "picture_choice" ? (
              <button className="btn-ghost h-6 px-1.5 text-xs" onClick={() => setBulkOpen(true)}>
                <ListPlus className="size-3.5" /> Bulk edit
              </button>
            ) : null
          }
        >
          {t !== "dropdown" ? (
            <>
              <Toggle label="Multiple selection" checked={Boolean(p.allowMultiple)} onChange={(v) => prop("allowMultiple", v)} />
              {p.allowMultiple ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Min picks</label>
                    <NumberInput value={p.minSelections} min={1} placeholder="Any" onChange={(v) => prop("minSelections", v)} />
                  </div>
                  <div>
                    <label className="label">Max picks</label>
                    <NumberInput value={p.maxSelections} min={1} placeholder="Any" onChange={(v) => prop("maxSelections", v)} />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
          {t === "multiple_choice" ? (
            <>
              <Toggle label={`"Other" option`} description="Lets people type their own answer." checked={Boolean(p.allowOther)} onChange={(v) => prop("allowOther", v)} />
              <Toggle label="Randomize order" checked={Boolean(p.randomize)} onChange={(v) => prop("randomize", v)} />
            </>
          ) : null}
          <p className="text-[11px] text-ink-3">Edit choices directly on the canvas. Press Enter to add another.</p>
        </Section>
      ) : null}

      {t === "rating" ? (
        <Section title="Rating">
          <div>
            <label className="label">Steps</label>
            <Segmented
              size="sm"
              value={String(p.steps ?? 5)}
              onChange={(v) => prop("steps", Number(v))}
              options={["3", "4", "5", "6", "7", "8", "9", "10"].map((v) => ({ value: v, label: v }))}
            />
          </div>
          <div>
            <label className="label">Shape</label>
            <Segmented
              size="sm"
              value={p.shape ?? "star"}
              onChange={(v) => prop("shape", v)}
              options={[
                { value: "star", label: "★ Star" },
                { value: "heart", label: "♥ Heart" },
                { value: "circle", label: "● Circle" },
              ]}
            />
          </div>
        </Section>
      ) : null}

      {t === "opinion_scale" || t === "nps" ? (
        <Section title="Scale">
          {t === "opinion_scale" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Start at</label>
                <Segmented size="sm" value={String(p.start ?? 1)} onChange={(v) => prop("start", Number(v) as 0 | 1)} options={[{ value: "0", label: "0" }, { value: "1", label: "1" }]} />
              </div>
              <div>
                <label className="label">Steps</label>
                <select className="input" value={p.steps ?? 10} onChange={(e) => prop("steps", Number(e.target.value))}>
                  {[5, 6, 7, 8, 9, 10, 11].map((n) => (
                    <option key={n} value={n}>
                      {n} ({p.start ?? 1}–{(p.start ?? 1) + n - 1})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-3">0–10 scale. Results show your Net Promoter Score.</p>
          )}
          <div>
            <label className="label">Left label</label>
            <input className="input" value={p.labelLeft ?? ""} onChange={(e) => prop("labelLeft", e.target.value)} />
          </div>
          {t === "opinion_scale" ? (
            <div>
              <label className="label">Center label</label>
              <input className="input" value={p.labelCenter ?? ""} onChange={(e) => prop("labelCenter", e.target.value)} />
            </div>
          ) : null}
          <div>
            <label className="label">Right label</label>
            <input className="input" value={p.labelRight ?? ""} onChange={(e) => prop("labelRight", e.target.value)} />
          </div>
        </Section>
      ) : null}

      {t === "date" ? (
        <Section title="Date">
          <label className="label">Format</label>
          <Segmented
            size="sm"
            value={p.dateFormat ?? "MDY"}
            onChange={(v) => prop("dateFormat", v)}
            options={[
              { value: "MDY", label: "MM/DD/YYYY" },
              { value: "DMY", label: "DD/MM/YYYY" },
              { value: "YMD", label: "YYYY/MM/DD" },
            ]}
          />
        </Section>
      ) : null}

      <AttachmentEditor value={field.attachment} onChange={(attachment) => set((f) => ({ ...f, attachment }))} />

      <BulkEditDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        initial={(p.choices ?? []).map((c) => c.label).join("\n")}
        onSave={(text) => {
          const labels = text.split("\n").map((s) => s.trim()).filter(Boolean);
          const existing = p.choices ?? [];
          // Keep ids for unchanged labels so logic rules survive.
          const choices = labels.map((label) => existing.find((c) => c.label === label) ?? { id: uid("c"), label });
          prop("choices", choices);
        }}
      />
    </>
  );
}

function BulkEditDialog({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: string;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  if (open && initial !== lastInitial) {
    setLastInitial(initial);
    setText(initial);
  }
  return (
    <Dialog open={open} onClose={onClose} title="Bulk edit choices" description="One choice per line. Great for pasting long lists.">
      <textarea className="input h-64 font-mono text-[13px]" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-primary"
          onClick={() => {
            onSave(text);
            onClose();
          }}
        >
          Save {text.split("\n").filter((l) => l.trim()).length} choices
        </button>
      </div>
    </Dialog>
  );
}

const LAYOUTS: { value: AttachmentLayout; label: string; icon: React.ReactNode }[] = [
  { value: "stack", label: "Stack", icon: <LayoutGlyph kind="stack" /> },
  { value: "split-left", label: "Left", icon: <LayoutGlyph kind="split-left" /> },
  { value: "split-right", label: "Right", icon: <LayoutGlyph kind="split-right" /> },
  { value: "wallpaper", label: "Wallpaper", icon: <LayoutGlyph kind="wallpaper" /> },
];

function LayoutGlyph({ kind }: { kind: AttachmentLayout }) {
  return (
    <svg viewBox="0 0 36 24" className="h-6 w-9">
      <rect x="0.5" y="0.5" width="35" height="23" rx="3" fill="white" stroke="currentColor" strokeOpacity=".3" />
      {kind === "stack" ? <rect x="12" y="4" width="12" height="7" rx="1" fill="currentColor" opacity=".55" /> : null}
      {kind === "split-left" ? <rect x="1" y="1" width="16" height="22" rx="2" fill="currentColor" opacity=".55" /> : null}
      {kind === "split-right" ? <rect x="19" y="1" width="16" height="22" rx="2" fill="currentColor" opacity=".55" /> : null}
      {kind === "wallpaper" ? <rect x="1" y="1" width="34" height="22" rx="2" fill="currentColor" opacity=".35" /> : null}
      <rect x={kind === "split-left" ? 21 : 5} y="14" width="10" height="2" rx="1" fill="currentColor" />
      <rect x={kind === "split-left" ? 21 : 5} y="18" width="6" height="2" rx="1" fill="currentColor" opacity=".6" />
    </svg>
  );
}

export function AttachmentEditor({
  value,
  onChange,
}: {
  value?: Attachment;
  onChange: (a: Attachment | undefined) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <Section
      title="Image"
      aside={
        value?.url ? (
          <button className="btn-ghost h-6 px-1.5 text-xs text-red-600" onClick={() => onChange(undefined)}>
            <Trash2 className="size-3.5" /> Remove
          </button>
        ) : null
      }
    >
      {value?.url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt="" className="h-28 w-full rounded-lg border border-line object-cover" />
          <div className="grid grid-cols-4 gap-1.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                onClick={() => onChange({ ...value, layout: l.value })}
                className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[10px] transition ${
                  value.layout === l.value ? "border-ink text-ink" : "border-line text-ink-3 hover:border-line-2"
                }`}
              >
                {l.icon}
                {l.label}
              </button>
            ))}
          </div>
          <input className="input" placeholder="Alt text" value={value.alt ?? ""} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
        </>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              const url = await uploadImage(f);
              setBusy(false);
              if (url) onChange({ url, layout: "split-right" });
            }}
          />
          <button className="btn-outline w-full" onClick={() => fileRef.current?.click()} disabled={busy}>
            <ImagePlus className="size-4" /> {busy ? "Uploading…" : "Upload image"}
          </button>
          <input
            className="input"
            placeholder="…or paste an image URL"
            onKeyDown={(e) => {
              const v = e.currentTarget.value.trim();
              if (e.key === "Enter" && /^https?:\/\//.test(v)) onChange({ url: v, layout: "split-right" });
            }}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim();
              if (/^https?:\/\//.test(v)) onChange({ url: v, layout: "split-right" });
            }}
          />
        </>
      )}
    </Section>
  );
}

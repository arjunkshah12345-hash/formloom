"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ArrowRight, AtSign, GripVertical, ImagePlus, Monitor, Plus, Smartphone, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { recallLabels, stripTokens, truncate } from "@/lib/engine";
import { uid, type Choice, type Field, type FormDefinition } from "@/lib/schema";
import { FieldInput, autoAdvances } from "@/components/player/inputs";
import { ScreenLayout } from "@/components/player/shell";
import { fontHref, isDark, themeVars } from "@/components/player/theme";
import { Menu, MenuItem } from "@/components/ui";
import { updateEnding, updateField, type Selection } from "./ops";
import { useWorkspace } from "./workspace";
import { uploadImage } from "./upload";

type EditHandle = { insert: (text: string) => void };

const EditText = forwardRef<
  EditHandle,
  { value: string; onChange: (v: string) => void; placeholder: string; className?: string; coalesce?: string }
>(function EditText({ value, onChange, placeholder, className = "" }, ref) {
  const el = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  useEffect(() => {
    const t = el.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${t.scrollHeight}px`;
  }, [value]);
  useImperativeHandle(ref, () => ({
    insert(text: string) {
      const pos = caret.current ?? value.length;
      const next = value.slice(0, pos) + text + value.slice(pos);
      onChange(next);
      requestAnimationFrame(() => {
        el.current?.focus();
        el.current?.setSelectionRange(pos + text.length, pos + text.length);
      });
    },
  }));
  return (
    <textarea
      ref={el}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onSelect={(e) => (caret.current = e.currentTarget.selectionStart)}
      onBlur={(e) => (caret.current = e.currentTarget.selectionStart)}
      className={`fl-edit ${className}`}
    />
  );
});

export function Canvas({ selection }: { selection: Selection }) {
  const { def, update } = useWorkspace();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const theme = def.theme;

  let body: React.ReactNode = null;
  if (selection.kind === "welcome") {
    body = <WelcomeEditor />;
  } else if (selection.kind === "ending") {
    const ending = def.endings.find((e) => e.id === selection.id);
    if (ending) {
      const set = (patch: Partial<typeof ending>, key: string) =>
        update((d) => updateEnding(d, ending.id, (e) => ({ ...e, ...patch })), { coalesce: `${ending.id}:${key}` });
      body = (
        <ScreenLayout attachment={ending.attachment} align={theme.align}>
          <div className="fl-done-badge">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.6}>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <div className="fl-heading">
            <EditText className="fl-title block" value={ending.title} placeholder="Ending title" onChange={(v) => set({ title: v }, "t")} />
            <EditText
              className="fl-description mt-2.5 block"
              value={ending.description ?? ""}
              placeholder="Description (optional)"
              onChange={(v) => set({ description: v }, "d")}
            />
          </div>
          {ending.buttonText ? (
            <div className="fl-actions">
              <span className="fl-button">{ending.buttonText}</span>
            </div>
          ) : null}
        </ScreenLayout>
      );
    }
  } else {
    const field = def.fields.find((f) => f.id === selection.id);
    if (field) body = <FieldEditor field={field} def={def} />;
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col bg-paper dot-grid">
      <div className="flex items-center justify-center gap-1 py-2.5">
        <div className="inline-flex rounded-lg bg-surface p-0.5 shadow-sm ring-1 ring-line">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex size-7 items-center justify-center rounded-md transition ${device === d ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"}`}
              aria-label={d}
            >
              {d === "desktop" ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-stretch justify-center px-6 pb-6">
        <div
          className={`relative overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,.35)] ring-1 ring-black/5 transition-all duration-300 ${
            device === "mobile" ? "w-[390px] max-w-full rounded-[28px]" : "w-full max-w-[1100px] rounded-xl"
          }`}
        >
          <div
            className={`fl-root is-contained ${isDark(theme.background) ? "is-dark" : ""} ${device === "mobile" ? "[&_.fl-center]:px-5" : ""}`}
            style={themeVars(theme)}
          >
            <link rel="stylesheet" href={fontHref(theme.font)} />
            {theme.backgroundImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={theme.backgroundImage} alt="" className="fl-bg-img" />
                <div className="fl-bg-veil" />
              </>
            ) : null}
            {def.settings.showProgress && selection.kind === "field" ? (
              <div className="fl-progress">
                <div
                  className="fl-progress-bar"
                  style={{
                    width: `${Math.max(4, (def.fields.findIndex((f) => f.id === selection.id) / Math.max(def.fields.length, 1)) * 100)}%`,
                  }}
                />
              </div>
            ) : null}
            <div className="fl-stage overflow-y-auto">{body}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeEditor() {
  const { def, update } = useWorkspace();
  const w = def.welcome;
  const set = (patch: Partial<typeof w>, key: string) =>
    update((d) => ({ ...d, welcome: { ...d.welcome, ...patch } }), { coalesce: `welcome:${key}` });
  if (!w.enabled) {
    return (
      <div className="fl-center">
        <div className="fl-content text-center">
          <p className="fl-description">The welcome screen is turned off.</p>
          <button className="fl-button mt-6" onClick={() => set({ enabled: true }, "on")}>
            Turn it on
          </button>
        </div>
      </div>
    );
  }
  return (
    <ScreenLayout attachment={w.attachment} align={def.theme.align}>
      <div className="fl-heading">
        <EditText className="fl-title block" value={w.title} placeholder="Say hi 👋" onChange={(v) => set({ title: v }, "t")} />
        <EditText
          className="fl-description mt-2.5 block"
          value={w.description ?? ""}
          placeholder="Description (optional)"
          onChange={(v) => set({ description: v }, "d")}
        />
      </div>
      <div className="fl-actions">
        <span className="fl-button">
          <input
            className="w-auto min-w-8 bg-transparent outline-none"
            size={Math.max(4, w.buttonText.length)}
            value={w.buttonText}
            onChange={(e) => set({ buttonText: e.target.value }, "b")}
          />
        </span>
        <span className="fl-hint text-xs">
          press <b>Enter ↵</b>
        </span>
      </div>
    </ScreenLayout>
  );
}

function FieldEditor({ field, def }: { field: Field; def: FormDefinition }) {
  const { update } = useWorkspace();
  const titleRef = useRef<EditHandle>(null);
  const idx = def.fields.findIndex((f) => f.id === field.id);
  const number = def.fields.slice(0, idx + 1).filter((f) => f.type !== "statement").length;
  const set = (fn: (f: Field) => Field, key?: string) =>
    update((d) => updateField(d, field.id, fn), key ? { coalesce: `${field.id}:${key}` } : undefined);

  const recallable = def.fields.slice(0, idx).filter((f) => f.type !== "statement");
  const hasTokens = /\{\{(field|hidden):/.test(field.title);

  return (
    <ScreenLayout attachment={field.attachment} align={def.theme.align}>
      <div className="fl-heading">
        <div className="fl-title">
          {def.settings.showNumbers && field.type !== "statement" ? (
            <span className="fl-number">
              {number}
              <ArrowRight className="size-3.5" strokeWidth={2.5} />
            </span>
          ) : null}
          <div className="relative min-w-0 flex-1">
            <EditText
              ref={titleRef}
              className="block"
              value={field.title}
              placeholder="Your question here. Recall answers with @"
              onChange={(v) => set((f) => ({ ...f, title: v }), "title")}
            />
            {hasTokens ? (
              <p className="mt-1 font-sans text-xs" style={{ color: "var(--fl-q-60)" }}>
                Shows as: {truncate(recallLabels(field.title, def), 90)}
              </p>
            ) : null}
          </div>
          {recallable.length || def.settings.hiddenFields.length ? (
            <Menu
              trigger={({ onClick }) => (
                <button
                  type="button"
                  onClick={onClick}
                  title="Recall an answer"
                  className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md font-sans opacity-50 transition hover:bg-[var(--fl-a-14)] hover:opacity-100"
                >
                  <AtSign className="size-4" />
                </button>
              )}
            >
              {(close) => (
                <div className="max-h-72 w-72 overflow-y-auto font-sans">
                  <p className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">Recall information from…</p>
                  {recallable.map((f) => (
                    <MenuItem
                      key={f.id}
                      onClick={() => {
                        close();
                        titleRef.current?.insert(`{{field:${f.id}}}`);
                      }}
                    >
                      <span className="truncate">{truncate(stripTokens(f.title), 40)}</span>
                    </MenuItem>
                  ))}
                  {def.settings.hiddenFields.map((h) => (
                    <MenuItem
                      key={h}
                      onClick={() => {
                        close();
                        titleRef.current?.insert(`{{hidden:${h}}}`);
                      }}
                    >
                      <span className="rounded bg-violet-50 px-1.5 text-xs text-violet-700">hidden</span> {h}
                    </MenuItem>
                  ))}
                </div>
              )}
            </Menu>
          ) : null}
          {field.required && field.type !== "statement" ? <span className="fl-required">*</span> : null}
        </div>
        <EditText
          className="fl-description mt-2.5 block"
          value={field.description ?? ""}
          placeholder="Description (optional)"
          onChange={(v) => set((f) => ({ ...f, description: v || undefined }), "desc")}
        />
      </div>

      <div className="fl-answer">
        {field.type === "multiple_choice" || field.type === "dropdown" ? (
          <ChoiceListEditor field={field} onChange={(choices) => set((f) => ({ ...f, properties: { ...f.properties, choices } }), "choices")} />
        ) : field.type === "picture_choice" ? (
          <PictureChoiceEditor field={field} onChange={(choices) => set((f) => ({ ...f, properties: { ...f.properties, choices } }), "choices")} />
        ) : (
          <div className={field.type === "statement" ? "" : "pointer-events-none"}>
            <FieldInput field={field} value={undefined} onChange={() => {}} onAdvance={() => {}} active={false} inert />
          </div>
        )}
      </div>

      {field.type === "statement" || !autoAdvances(field) ? (
        <div className="fl-actions">
          <span className="fl-button">
            {field.type === "statement" ? (
              <input
                className="w-auto bg-transparent outline-none"
                size={Math.max(4, (field.properties.buttonText ?? "Continue").length)}
                value={field.properties.buttonText ?? "Continue"}
                onChange={(e) => set((f) => ({ ...f, properties: { ...f.properties, buttonText: e.target.value } }), "btn")}
              />
            ) : (
              "OK"
            )}
          </span>
          <span className="fl-hint text-xs">
            press <b>Enter ↵</b>
          </span>
        </div>
      ) : null}
    </ScreenLayout>
  );
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function ChoiceListEditor({ field, onChange }: { field: Field; onChange: (c: Choice[]) => void }) {
  const choices = field.properties.choices ?? [];
  const refs = useRef(new Map<string, HTMLInputElement>());
  // Focus a newly created/neighbouring choice once its input mounts.
  const pendingFocus = useRef<string | null>(null);
  const setFocusId = (id: string) => {
    const el = refs.current.get(id);
    if (el) el.focus();
    else pendingFocus.current = id;
  };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const add = (after?: number) => {
    const c = { id: uid("c"), label: "" };
    const next = [...choices];
    next.splice(after === undefined ? next.length : after + 1, 0, c);
    onChange(next);
    setFocusId(c.id);
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = choices.findIndex((c) => c.id === e.active.id);
    const to = choices.findIndex((c) => c.id === e.over!.id);
    const next = [...choices];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5" style={{ maxWidth: 520 }}>
      {field.type === "dropdown" ? (
        <p className="fl-hint -mt-1 font-sans">Respondents type to filter these options.</p>
      ) : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={choices.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {choices.map((c, i) => (
            <SortableChoice key={c.id} id={c.id}>
              {(handle) => (
                <div className="fl-choice group/choice cursor-text">
                  <span className="fl-key cursor-grab" {...handle}>
                    <span className="group-hover/choice:hidden">{LETTERS[i] ?? "•"}</span>
                    <GripVertical className="hidden size-3 group-hover/choice:block" />
                  </span>
                  <input
                    ref={(el) => {
                      if (el) {
                        refs.current.set(c.id, el);
                        if (pendingFocus.current === c.id) {
                          pendingFocus.current = null;
                          el.focus();
                        }
                      } else refs.current.delete(c.id);
                    }}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-40"
                    placeholder={`Choice ${i + 1}`}
                    value={c.label}
                    onChange={(e) => onChange(choices.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        add(i);
                      } else if (e.key === "Backspace" && !c.label && choices.length > 1) {
                        e.preventDefault();
                        onChange(choices.filter((x) => x.id !== c.id));
                        const prev = choices[i - 1] ?? choices[i + 1];
                        if (prev) setFocusId(prev.id);
                      }
                    }}
                  />
                  {choices.length > 1 ? (
                    <button
                      type="button"
                      className="opacity-0 transition group-hover/choice:opacity-70 hover:!opacity-100"
                      onClick={() => onChange(choices.filter((x) => x.id !== c.id))}
                      aria-label="Remove choice"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              )}
            </SortableChoice>
          ))}
        </SortableContext>
      </DndContext>
      {field.properties.allowOther ? (
        <div className="fl-choice opacity-70">
          <span className="fl-key">{LETTERS[choices.length]}</span>
          Other
        </div>
      ) : null}
      <button type="button" onClick={() => add()} className="fl-ghost w-fit font-sans underline-offset-4 hover:underline">
        <Plus className="size-4" /> Add choice
      </button>
    </div>
  );
}

function SortableChoice({ id, children }: { id: string; children: (handle: Record<string, unknown>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, position: "relative" }}
    >
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

function PictureChoiceEditor({ field, onChange }: { field: Field; onChange: (c: Choice[]) => void }) {
  const choices = field.properties.choices ?? [];
  const [uploading, setUploading] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const setChoice = (id: string, patch: Partial<Choice>) =>
    onChange(choices.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = choices.findIndex((c) => c.id === e.active.id);
    const to = choices.findIndex((c) => c.id === e.over!.id);
    const next = [...choices];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={choices.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" style={{ maxWidth: 640 }}>
          {choices.map((c, i) => (
            <SortableChoice key={c.id} id={c.id}>
              {(handle) => (
                <div className="fl-choice fl-picture group/pic">
                  <label className="fl-picture-img relative cursor-pointer" {...handle}>
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.imageUrl} alt="" draggable={false} />
                    ) : (
                      <span className="flex flex-col items-center gap-1 font-sans text-xs opacity-60">
                        <ImagePlus className="size-6" />
                        {uploading === c.id ? "Uploading…" : "Add image"}
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(c.id);
                        const url = await uploadImage(file);
                        setUploading(null);
                        if (url) setChoice(c.id, { imageUrl: url });
                      }}
                    />
                  </label>
                  <span className="flex w-full items-center gap-2">
                    <span className="fl-key">{LETTERS[i]}</span>
                    <input
                      className="min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-40"
                      value={c.label}
                      placeholder={`Option ${i + 1}`}
                      onChange={(e) => setChoice(c.id, { label: e.target.value })}
                    />
                    {choices.length > 1 ? (
                      <button
                        type="button"
                        className="opacity-0 group-hover/pic:opacity-70 hover:!opacity-100"
                        onClick={() => onChange(choices.filter((x) => x.id !== c.id))}
                        aria-label="Remove"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </span>
                </div>
              )}
            </SortableChoice>
          ))}
          <button
            type="button"
            onClick={() => onChange([...choices, { id: uid("c"), label: "" }])}
            className="fl-choice fl-picture items-center justify-center border-dashed font-sans text-sm"
          >
            <Plus className="size-5" /> Add choice
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

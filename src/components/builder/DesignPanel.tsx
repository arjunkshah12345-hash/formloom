"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { FONTS, THEME_PRESETS, presetTheme, type Theme } from "@/lib/schema";
import { fontStack } from "@/components/player/theme";
import { Segmented } from "@/components/ui";
import { Section } from "./QuestionPanel";
import { uploadImage } from "./upload";
import { useWorkspace } from "./workspace";

const COLOR_KEYS: { key: keyof Theme; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "question", label: "Questions" },
  { key: "answer", label: "Answers" },
  { key: "button", label: "Buttons" },
  { key: "buttonText", label: "Button text" },
];

export function DesignPanel() {
  const { def, update } = useWorkspace();
  const theme = def.theme;
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Theme>, key = "theme") =>
    update((d) => ({ ...d, theme: { ...d.theme, ...patch, preset: patch.preset ?? undefined } }), { coalesce: key });

  return (
    <>
      <Section title="Themes">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(THEME_PRESETS).map(([key, t]) => {
            const active = theme.preset === key;
            return (
              <button
                key={key}
                onClick={() => update((d) => ({ ...d, theme: { ...presetTheme(key), backgroundImage: d.theme.backgroundImage, backgroundOverlay: d.theme.backgroundOverlay } }))}
                className={`relative overflow-hidden rounded-lg border p-2.5 text-left transition ${active ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-2"}`}
                style={{ background: t.background, color: t.question, fontFamily: fontStack(t.font) }}
              >
                <span className="block text-[13px] leading-tight">{t.name}</span>
                <span className="mt-2 flex items-center gap-1">
                  <span className="h-2.5 w-6 rounded-sm" style={{ background: t.answer }} />
                  <span className="h-2.5 w-4 rounded-sm" style={{ background: t.button }} />
                </span>
                {active ? (
                  <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-ink text-paper">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Typography">
        <select className="input" value={theme.font} onChange={(e) => set({ font: e.target.value }, "font")} style={{ fontFamily: fontStack(theme.font) }}>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between">
          <span className="text-sm">Alignment</span>
          <Segmented
            size="sm"
            value={theme.align}
            onChange={(align) => set({ align }, "align")}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
            ]}
          />
        </div>
      </Section>

      <Section title="Colors">
        {COLOR_KEYS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <span className="text-sm">{label}</span>
            <label className="flex items-center gap-2 rounded-lg border border-line-2 bg-surface py-1 pr-2 pl-1">
              <span className="relative size-6 overflow-hidden rounded-md ring-1 ring-black/10" style={{ background: String(theme[key]) }}>
                <input
                  type="color"
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                  value={String(theme[key])}
                  onChange={(e) => set({ [key]: e.target.value }, `color:${key}`)}
                />
              </span>
              <input
                className="w-[68px] bg-transparent font-mono text-xs uppercase outline-none"
                value={String(theme[key])}
                onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && set({ [key]: e.target.value }, `color:${key}`)}
              />
            </label>
          </div>
        ))}
      </Section>

      <Section title="Corners">
        <Segmented
          size="sm"
          value={theme.radius}
          onChange={(radius) => set({ radius }, "radius")}
          options={[
            { value: "none", label: "Square" },
            { value: "small", label: "Soft" },
            { value: "large", label: "Round" },
            { value: "pill", label: "Pill" },
          ]}
        />
      </Section>

      <Section
        title="Background image"
        aside={
          theme.backgroundImage ? (
            <button className="btn-ghost h-6 px-1.5 text-xs text-red-600" onClick={() => set({ backgroundImage: undefined }, "bg")}>
              <Trash2 className="size-3.5" /> Remove
            </button>
          ) : null
        }
      >
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
            if (url) set({ backgroundImage: url }, "bg");
          }}
        />
        {theme.backgroundImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={theme.backgroundImage} alt="" className="h-24 w-full rounded-lg object-cover" />
            <div>
              <label className="label flex justify-between">
                <span>Overlay</span>
                <span className="tabular-nums">{Math.round((theme.backgroundOverlay ?? 0.4) * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={theme.backgroundOverlay ?? 0.4}
                onChange={(e) => set({ backgroundOverlay: Number(e.target.value) }, "overlay")}
                className="w-full accent-ink"
              />
            </div>
          </>
        ) : (
          <button className="btn-outline w-full" onClick={() => fileRef.current?.click()} disabled={busy}>
            <ImagePlus className="size-4" /> {busy ? "Uploading…" : "Upload background"}
          </button>
        )}
      </Section>
    </>
  );
}

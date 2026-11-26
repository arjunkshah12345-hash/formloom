"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import Player from "@/components/player/Player";
import { QuestionHeadingLevel } from "@/components/player/shell";
import { THEME_PRESETS, presetTheme, type FormDefinition } from "@/lib/schema";

const KEYS = Object.keys(THEME_PRESETS);

/** Live, fully interactive demo form whose theme can be swapped on the fly. */
export function ThemedDemo({ definition }: { definition: FormDefinition }) {
  const [preset, setPreset] = useState(definition.theme.preset ?? "forest");
  const [run, setRun] = useState(0);
  const def = { ...definition, theme: presetTheme(preset) };

  return (
    <div className="overflow-hidden rounded-[inherit] bg-surface">
      <div>
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 truncate rounded-md bg-paper px-3 py-1 font-mono text-xs text-ink-3">
            yourdomain.com/f/hello
          </span>
          <button
            onClick={() => setRun((r) => r + 1)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-3 transition hover:bg-paper hover:text-ink"
          >
            <RotateCcw className="size-3.5" /> Restart
          </button>
        </div>
        <div className="h-[520px] sm:h-[600px]">
          <QuestionHeadingLevel.Provider value="h2">
            <Player key={run} definition={def} mode="preview" contained hidePreviewTag />
          </QuestionHeadingLevel.Provider>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <span className="mr-1 font-tech text-[11px] tracking-[0.12em] text-ink-3 uppercase">Theme</span>
        {KEYS.map((k) => {
          const t = THEME_PRESETS[k];
          const active = k === preset;
          return (
            <button
              key={k}
              onClick={() => setPreset(k)}
              className={`group inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs transition ${
                active ? "border-ink bg-ink text-paper" : "border-line-2 bg-surface text-ink-2 hover:border-ink-3"
              }`}
            >
              <span
                className="flex size-5 items-center justify-center rounded-full ring-1 ring-black/10"
                style={{ background: t.background }}
              >
                <span className="size-2 rounded-full" style={{ background: t.button }} />
              </span>
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { FIELD_META, FIELD_TYPES, type FieldType } from "@/lib/schema";
import { TypeIcon } from "./TypeIcon";

const GROUPS = ["Text", "Choice", "Rating", "Other"] as const;

/** Popover listing every question type, grouped. */
export function TypePicker({
  open,
  onClose,
  onPick,
  anchor,
  current,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (t: FieldType) => void;
  anchor: HTMLElement | null;
  current?: FieldType;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && anchor ? (
        <PickerBody
          key="picker"
          anchor={anchor}
          onClose={onClose}
          onPick={onPick}
          current={current}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function PickerBody({
  onClose,
  onPick,
  anchor,
  current,
}: {
  onClose: () => void;
  onPick: (t: FieldType) => void;
  anchor: HTMLElement;
  current?: FieldType;
}) {
  // Mounted fresh on every open, so search state resets naturally.
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [pos] = useState(() => {
    const r = anchor.getBoundingClientRect();
    const width = 540;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
    const top = Math.min(r.bottom + 6, window.innerHeight - 440);
    return { top: Math.max(12, top), left };
  });

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !anchor.contains(e.target as Node)
      )
        onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  const q = query.toLowerCase();
  const matches = FIELD_TYPES.filter((t) =>
    FIELD_META[t].label.toLowerCase().includes(q),
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.14 }}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 w-[540px] max-w-[calc(100vw-24px)] rounded-2xl border border-line bg-surface p-3 shadow-2xl"
    >
      <input
        autoFocus
        className="input mb-3"
        placeholder="Search question types…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            onPick(matches[0]);
            onClose();
          }
        }}
      />
      <div className="grid max-h-[360px] grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto sm:grid-cols-2">
        {GROUPS.map((g) => {
          const types = matches.filter((t) => FIELD_META[t].group === g);
          if (!types.length) return null;
          return (
            <div key={g}>
              <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
                {g}
              </p>
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onPick(t);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-paper ${
                    current === t ? "bg-paper" : ""
                  }`}
                >
                  <TypeIcon type={t} />
                  <span className="min-w-0">
                    <span className="block text-sm">{FIELD_META[t].label}</span>
                    <span className="block text-[11px] text-ink-3">
                      {FIELD_META[t].hint}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          );
        })}
        {!matches.length ? (
          <p className="col-span-2 px-2 py-6 text-center text-sm text-ink-3">
            No matches
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

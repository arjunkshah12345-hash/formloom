"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Heart, Star, Circle, X } from "lucide-react";
import type { AnswerValue, Field } from "@/lib/schema";
import { OTHER_PREFIX } from "@/lib/engine";

export type InputProps = {
  field: Field;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  /** Advance to the next step. Pass the fresh value when calling right after onChange. */
  onAdvance: (fresh?: AnswerValue) => void;
  active: boolean;
  /** Builder preview: render but don't steal focus. */
  inert?: boolean;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** True when the keystroke is being typed into a text box. */
function typingInto(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return false;
  return t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "checkbox") || t.isContentEditable;
}

function useKeys(active: boolean, handler: (e: KeyboardEvent) => void) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!active) return;
    const fn = (e: KeyboardEvent) => ref.current(e);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active]);
}

function useAutofocus<T extends HTMLElement>(active: boolean, inert?: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!active || inert) return;
    // Wait for the slide-in animation so focus doesn't jump the page.
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 320);
    return () => clearTimeout(t);
  }, [active, inert]);
  return ref;
}

// ---------------------------------------------------------------------------

export function TextAnswer({ field, value, onChange, active, inert }: InputProps) {
  const ref = useAutofocus<HTMLInputElement>(active, inert);
  const inputType =
    field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text";
  return (
    <input
      ref={ref}
      className="fl-text"
      type={inputType}
      inputMode={field.type === "number" ? "decimal" : field.type === "phone" ? "tel" : undefined}
      autoComplete={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "off"}
      placeholder={field.properties.placeholder || "Type your answer here..."}
      value={value === null || value === undefined ? "" : String(value)}
      maxLength={field.properties.maxLength}
      tabIndex={inert ? -1 : 0}
      readOnly={inert}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    />
  );
}

export function LongTextAnswer({ field, value, onChange, active, inert }: InputProps) {
  const ref = useAutofocus<HTMLTextAreaElement>(active, inert);
  const text = value === null || value === undefined ? "" : String(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [text, ref]);
  return (
    <div>
      <textarea
        ref={ref}
        rows={1}
        className="fl-text resize-none"
        placeholder={field.properties.placeholder || "Type your answer here..."}
        value={text}
        maxLength={field.properties.maxLength}
        tabIndex={inert ? -1 : 0}
        readOnly={inert}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      />
      <div className="fl-hint mt-2 flex justify-between gap-4">
        <span>
          <b>Shift ⇧ + Enter ↵</b> to make a line break
        </span>
        {field.properties.maxLength ? (
          <span>
            {text.length}/{field.properties.maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function shuffleStable<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ChoiceButton({
  letter,
  selected,
  blink,
  onClick,
  children,
  disabled,
}: {
  letter: string;
  selected: boolean;
  blink?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`fl-choice ${selected ? "is-selected" : ""} ${blink ? "is-blink" : ""}`}
      onClick={onClick}
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
    >
      <span className="fl-key">{letter}</span>
      <span className="min-w-0 flex-1 text-left break-words">{children}</span>
      <Check className={`fl-check size-5 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

export function ChoicesAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const p = field.properties;
  const multiple = Boolean(p.allowMultiple);
  const choices = useMemo(
    () => (p.randomize && !inert ? shuffleStable(p.choices ?? [], field.id) : (p.choices ?? [])),
    [p.choices, p.randomize, inert, field.id],
  );
  const selected: string[] = Array.isArray(value) ? value : value ? [String(value)] : [];
  const otherValue = selected.find((s) => s.startsWith(OTHER_PREFIX));
  const [otherOpen, setOtherOpen] = useState(Boolean(otherValue));
  const [blinkId, setBlinkId] = useState<string | null>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) => {
    if (inert) return;
    if (multiple) {
      const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
      onChange(next.length ? next : null);
    } else {
      const next = selected[0] === id ? null : [id];
      onChange(next);
      if (next) {
        setBlinkId(id);
        setTimeout(() => {
          setBlinkId(null);
          onAdvance(next);
        }, 420);
      }
    }
  };

  const openOther = () => {
    if (inert) return;
    setOtherOpen(true);
    setTimeout(() => otherRef.current?.focus(), 30);
  };

  const setOther = (text: string) => {
    const rest = multiple ? selected.filter((s) => !s.startsWith(OTHER_PREFIX)) : [];
    const next = [...rest, OTHER_PREFIX + text];
    onChange(next);
  };

  const clearOther = () => {
    setOtherOpen(false);
    const rest = selected.filter((s) => !s.startsWith(OTHER_PREFIX));
    onChange(rest.length ? rest : null);
  };

  useKeys(active && !inert, (e) => {
    if (typingInto(e) || e.metaKey || e.ctrlKey || e.altKey) return;
    const idx = LETTERS.indexOf(e.key.toUpperCase());
    if (idx < 0 || e.key.length !== 1) return;
    if (idx < choices.length) {
      e.preventDefault();
      toggle(choices[idx].id);
    } else if (p.allowOther && idx === choices.length) {
      e.preventDefault();
      openOther();
    }
  });

  return (
    <div className="flex flex-col gap-2.5" style={{ maxWidth: 520 }}>
      {multiple ? (
        <p className="fl-hint -mt-1 mb-1">
          {p.maxSelections ? `Choose up to ${p.maxSelections}` : "Choose as many as you like"}
        </p>
      ) : null}
      {choices.map((c, i) => (
        <ChoiceButton
          key={c.id}
          letter={LETTERS[i] ?? "•"}
          selected={selected.includes(c.id)}
          blink={blinkId === c.id}
          onClick={() => toggle(c.id)}
          disabled={inert}
        >
          {c.label || <span className="opacity-50">Choice {i + 1}</span>}
        </ChoiceButton>
      ))}
      {p.allowOther ? (
        otherOpen ? (
          <div className="fl-choice is-selected">
            <span className="fl-key">{LETTERS[choices.length]}</span>
            <input
              ref={otherRef}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-50"
              placeholder="Type your answer"
              value={otherValue ? otherValue.slice(OTHER_PREFIX.length) : ""}
              onChange={(e) => setOther(e.target.value)}
            />
            <button type="button" onClick={clearOther} aria-label="Remove other">
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <ChoiceButton letter={LETTERS[choices.length]} selected={false} onClick={openOther} disabled={inert}>
            Other
          </ChoiceButton>
        )
      ) : null}
    </div>
  );
}

export function PictureChoiceAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const p = field.properties;
  const multiple = Boolean(p.allowMultiple);
  const choices = p.choices ?? [];
  const selected: string[] = Array.isArray(value) ? value : value ? [String(value)] : [];
  const [blinkId, setBlinkId] = useState<string | null>(null);

  const toggle = (id: string) => {
    if (inert) return;
    if (multiple) {
      const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
      onChange(next.length ? next : null);
    } else {
      const next = selected[0] === id ? null : [id];
      onChange(next);
      if (next) {
        setBlinkId(id);
        setTimeout(() => {
          setBlinkId(null);
          onAdvance(next);
        }, 420);
      }
    }
  };

  useKeys(active && !inert, (e) => {
    if (typingInto(e) || e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    const idx = LETTERS.indexOf(e.key.toUpperCase());
    if (idx >= 0 && idx < choices.length) {
      e.preventDefault();
      toggle(choices[idx].id);
    }
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" style={{ maxWidth: 640 }}>
      {choices.map((c, i) => {
        const isSel = selected.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            tabIndex={inert ? -1 : 0}
            onClick={() => toggle(c.id)}
            className={`fl-choice fl-picture ${isSel ? "is-selected" : ""} ${blinkId === c.id ? "is-blink" : ""}`}
          >
            <span className="fl-picture-img">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt={c.label} draggable={false} />
              ) : (
                <span className="text-3xl opacity-40">🖼️</span>
              )}
            </span>
            <span className="flex w-full items-center gap-2">
              <span className="fl-key">{LETTERS[i]}</span>
              <span className="min-w-0 flex-1 truncate text-left">{c.label}</span>
              {isSel ? <Check className="size-4 shrink-0" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function DropdownAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const choices = useMemo(() => field.properties.choices ?? [], [field.properties.choices]);
  const current = choices.find((c) => c.id === value);
  const [query, setQuery] = useState(current?.label ?? "");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const ref = useAutofocus<HTMLInputElement>(active, inert);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (current && current.label === query)) return choices;
    return choices.filter((c) => c.label.toLowerCase().includes(q));
  }, [choices, query, current]);

  const pick = (id: string) => {
    const c = choices.find((x) => x.id === id);
    if (!c) return;
    setQuery(c.label);
    setOpen(false);
    onChange(c.id);
    setTimeout(() => onAdvance(c.id), 300);
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <div className="relative" style={{ maxWidth: 560 }}>
      <div className="relative">
        <input
          ref={ref}
          className="fl-text pr-12"
          placeholder="Type or select an option"
          value={query}
          tabIndex={inert ? -1 : 0}
          readOnly={inert}
          onFocus={() => !inert && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setCursor(0);
            if (current) onChange(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setCursor((c) => Math.min(c + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === "Enter" && open && filtered[cursor]) {
              e.preventDefault();
              e.nativeEvent.preventDefault();
              pick(filtered[cursor].id);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute top-1/2 right-1 -translate-y-1/2 p-2"
          style={{ color: "var(--fl-a)" }}
          onMouseDown={(e) => {
            e.preventDefault();
            if (current) {
              setQuery("");
              onChange(null);
            }
            setOpen((o) => !o);
            ref.current?.focus();
          }}
          aria-label="Toggle options"
        >
          {current ? <X className="size-5" /> : <ChevronDown className="size-6" />}
        </button>
      </div>
      {open && !inert ? (
        <div ref={listRef} className="fl-dropdown-list">
          {filtered.length ? (
            filtered.map((c, i) => (
              <button
                key={c.id}
                type="button"
                data-idx={i}
                className={`fl-choice w-full ${i === cursor ? "is-cursor" : ""} ${c.id === value ? "is-selected" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(c.id);
                }}
                onMouseEnter={() => setCursor(i)}
              >
                <span className="flex-1 text-left">{c.label}</span>
              </button>
            ))
          ) : (
            <p className="fl-hint px-2 py-3">No suggestions found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function BooleanAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const options =
    field.type === "legal"
      ? [
          { v: true, label: "I accept", key: "A" },
          { v: false, label: "I don't accept", key: "B" },
        ]
      : [
          { v: true, label: "Yes", key: "Y" },
          { v: false, label: "No", key: "N" },
        ];
  const [blink, setBlink] = useState<boolean | null>(null);
  const choose = (v: boolean) => {
    if (inert) return;
    onChange(v);
    setBlink(v);
    setTimeout(() => {
      setBlink(null);
      onAdvance(v);
    }, 420);
  };
  useKeys(active && !inert, (e) => {
    if (typingInto(e) || e.metaKey || e.ctrlKey) return;
    const o = options.find((x) => x.key === e.key.toUpperCase());
    if (o) {
      e.preventDefault();
      choose(o.v);
    }
  });
  return (
    <div className="flex flex-col gap-2.5" style={{ maxWidth: field.type === "legal" ? 320 : 200 }}>
      {options.map((o) => (
        <ChoiceButton
          key={o.key}
          letter={o.key}
          selected={value === o.v}
          blink={blink === o.v}
          onClick={() => choose(o.v)}
          disabled={inert}
        >
          {o.label}
        </ChoiceButton>
      ))}
    </div>
  );
}

export function RatingAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const steps = field.properties.steps ?? 5;
  const shape = field.properties.shape ?? "star";
  const Icon = shape === "heart" ? Heart : shape === "circle" ? Circle : Star;
  const [hover, setHover] = useState<number | null>(null);
  const current = typeof value === "number" ? value : value ? Number(value) : 0;
  const shown = hover ?? current;
  const choose = (n: number) => {
    if (inert) return;
    onChange(n);
    setTimeout(() => onAdvance(n), 380);
  };
  useKeys(active && !inert, (e) => {
    if (typingInto(e) || e.metaKey || e.ctrlKey) return;
    const n = e.key === "0" ? 10 : Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= steps) {
      e.preventDefault();
      choose(n);
    }
  });
  return (
    <div className="flex flex-wrap gap-1 sm:gap-2" onMouseLeave={() => setHover(null)}>
      {Array.from({ length: steps }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          tabIndex={inert ? -1 : 0}
          className="fl-rating group"
          onMouseEnter={() => !inert && setHover(n)}
          onClick={() => choose(n)}
          aria-label={`${n} of ${steps}`}
        >
          <Icon
            className="size-9 transition-transform duration-150 group-hover:scale-110 sm:size-12"
            strokeWidth={1.4}
            style={{
              color: "var(--fl-a)",
              fill: n <= shown ? "var(--fl-a)" : "transparent",
              opacity: n <= shown ? 1 : 0.55,
            }}
          />
          <span className="fl-hint mt-1 text-xs tabular-nums">{n}</span>
        </button>
      ))}
    </div>
  );
}

export function ScaleAnswer({ field, value, onChange, onAdvance, active, inert }: InputProps) {
  const isNps = field.type === "nps";
  const start = isNps ? 0 : (field.properties.start ?? 1);
  const steps = isNps ? 11 : (field.properties.steps ?? 10);
  const numbers = Array.from({ length: steps }, (_, i) => i + start);
  const current = value === null || value === undefined ? null : Number(value);
  const [blink, setBlink] = useState<number | null>(null);
  const choose = (n: number) => {
    if (inert) return;
    onChange(n);
    setBlink(n);
    setTimeout(() => {
      setBlink(null);
      onAdvance(n);
    }, 420);
  };
  useKeys(active && !inert, (e) => {
    if (typingInto(e) || e.metaKey || e.ctrlKey) return;
    const n = Number(e.key);
    if (e.key.length === 1 && Number.isInteger(n) && numbers.includes(n)) {
      e.preventDefault();
      choose(n);
    }
  });
  const left = field.properties.labelLeft;
  const center = field.properties.labelCenter;
  const right = field.properties.labelRight;
  return (
    <div style={{ maxWidth: 680 }}>
      <div className="fl-scale" style={{ gridTemplateColumns: `repeat(${numbers.length}, minmax(0, 1fr))` }}>
        {numbers.map((n) => (
          <button
            key={n}
            type="button"
            tabIndex={inert ? -1 : 0}
            className={`fl-choice fl-scale-btn ${current === n ? "is-selected" : ""} ${blink === n ? "is-blink" : ""}`}
            onClick={() => choose(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {left || center || right ? (
        <div className="fl-hint mt-3 grid grid-cols-3 text-sm">
          <span>{left}</span>
          <span className="text-center">{center}</span>
          <span className="text-right">{right}</span>
        </div>
      ) : null}
    </div>
  );
}

export function DateAnswer({ field, value, onChange, active, inert }: InputProps) {
  const fmt = field.properties.dateFormat ?? "MDY";
  const initial = useMemo(() => {
    const [y = "", m = "", d = ""] = typeof value === "string" ? value.split("-") : [];
    return { y: y.trim(), m: m.trim(), d: d.trim() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [parts, setParts] = useState(initial);
  const refs = { m: useRef<HTMLInputElement>(null), d: useRef<HTMLInputElement>(null), y: useRef<HTMLInputElement>(null) };
  const order = fmt.split("").map((c) => c.toLowerCase() as "m" | "d" | "y");
  const firstRef = refs[order[0]];
  useEffect(() => {
    if (!active || inert) return;
    const t = setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 320);
    return () => clearTimeout(t);
  }, [active, inert, firstRef]);

  const emit = (p: typeof parts) => {
    if (!p.y && !p.m && !p.d) return onChange(null);
    const complete = p.y.length === 4 && p.m && p.d;
    onChange(complete ? `${p.y}-${p.m.padStart(2, "0")}-${p.d.padStart(2, "0")}` : `${p.y} -${p.m} -${p.d} `);
  };

  const set = (k: "m" | "d" | "y", v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, k === "y" ? 4 : 2);
    const next = { ...parts, [k]: clean };
    setParts(next);
    emit(next);
    const full = k === "y" ? clean.length === 4 : clean.length === 2;
    const i = order.indexOf(k);
    if (full && i < 2) refs[order[i + 1]].current?.focus();
  };

  const labels = { m: "Month", d: "Day", y: "Year" };
  const ph = { m: "MM", d: "DD", y: "YYYY" };
  return (
    <div className="flex items-end gap-3">
      {order.map((k, i) => (
        <div key={k} className="flex items-end gap-3">
          {i > 0 ? <span className="fl-date-sep">/</span> : null}
          <label className="flex flex-col gap-1">
            <span className="fl-hint text-sm">{labels[k]}</span>
            <input
              ref={refs[k]}
              className="fl-text text-center"
              style={{ width: k === "y" ? "5.2ch" : "3.4ch" }}
              inputMode="numeric"
              placeholder={ph[k]}
              value={parts[k]}
              tabIndex={inert ? -1 : 0}
              readOnly={inert}
              onChange={(e) => set(k, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !parts[k] && i > 0) refs[order[i - 1]].current?.focus();
              }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

export function FieldInput(props: InputProps) {
  switch (props.field.type) {
    case "short_text":
    case "email":
    case "phone":
    case "url":
    case "number":
      return <TextAnswer {...props} />;
    case "long_text":
      return <LongTextAnswer {...props} />;
    case "multiple_choice":
      return <ChoicesAnswer {...props} />;
    case "picture_choice":
      return <PictureChoiceAnswer {...props} />;
    case "dropdown":
      return <DropdownAnswer {...props} />;
    case "yes_no":
    case "legal":
      return <BooleanAnswer {...props} />;
    case "rating":
      return <RatingAnswer {...props} />;
    case "opinion_scale":
    case "nps":
      return <ScaleAnswer {...props} />;
    case "date":
      return <DateAnswer {...props} />;
    case "statement":
      return null;
  }
}

/** Types that advance on selection, so they don't need an OK button unless multi-select. */
export function autoAdvances(field: Field) {
  if (field.type === "multiple_choice" || field.type === "picture_choice") return !field.properties.allowMultiple;
  return ["yes_no", "legal", "rating", "opinion_scale", "nps", "dropdown"].includes(field.type);
}

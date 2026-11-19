"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, RotateCcw, AlertTriangle } from "lucide-react";
import type { AnswerValue, Answers, FormDefinition } from "@/lib/schema";
import { nextStep, recall, validateAnswer, visiblePath } from "@/lib/engine";
import { autoAdvances, FieldInput } from "./inputs";
import { ActionButton, QuestionHeading, RichText, ScreenLayout } from "./shell";
import { fontHref, isDark, themeVars } from "./theme";

type Stage =
  | { kind: "welcome" }
  | { kind: "field"; id: string }
  | { kind: "ending"; id: string }
  | { kind: "closed" };

export type PlayerMode = "live" | "preview" | "embed";

type Props = {
  definition: FormDefinition;
  slug?: string;
  mode?: PlayerMode;
  closedMessage?: string | null;
  /** Fill the container instead of the viewport (builder/preview frames). */
  contained?: boolean;
  /** Hide the "Preview" pill (used for the marketing demo). */
  hidePreviewTag?: boolean;
};

const noopSubscribe = () => () => {};

function visitorId(slug: string) {
  const key = `fl_v_${slug}`;
  try {
    let v = sessionStorage.getItem(key);
    if (!v) {
      v = crypto.randomUUID();
      sessionStorage.setItem(key, v);
    }
    return v;
  } catch {
    return crypto.randomUUID();
  }
}

export default function Player({ definition: def, slug, mode = "live", closedMessage, contained, hidePreviewTag }: Props) {
  const firstStage = (): Stage =>
    closedMessage
      ? { kind: "closed" }
      : def.welcome.enabled
        ? { kind: "welcome" }
        : def.fields[0]
          ? { kind: "field", id: def.fields[0].id }
          : { kind: "ending", id: def.endings[0]?.id };

  const [stage, setStage] = useState<Stage>(firstStage);
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const answersRef = useRef(answers);
  const startedAt = useRef<number | null>(null);
  const visitor = useRef<string>("");
  const busy = useRef(false);
  const live = mode !== "preview" && Boolean(slug);

  // Hidden fields come from the URL (?name=Ada&source=newsletter).
  const search = useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => "",
  );
  const hidden = useMemo(() => {
    const params = new URLSearchParams(search);
    const h: Record<string, string> = {};
    for (const key of def.settings.hiddenFields) {
      const v = params.get(key);
      if (v) h[key] = v.slice(0, 500);
    }
    return h;
  }, [search, def.settings.hiddenFields]);

  const track = useCallback(
    (type: "view" | "start" | "reach", fieldId?: string) => {
      if (!live || !slug) return;
      if (!visitor.current) visitor.current = visitorId(slug);
      const body = JSON.stringify({ type, fieldId, visitor: visitor.current });
      const url = `/api/f/${slug}/events`;
      if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      else fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
    },
    [live, slug],
  );

  useEffect(() => {
    if (!closedMessage) track("view");
  }, [track, closedMessage]);

  useEffect(() => {
    if (stage.kind === "field") track("reach", stage.id);
  }, [stage, track]);

  const fieldIndex = useMemo(() => new Map(def.fields.map((f, i) => [f.id, i])), [def.fields]);
  const numbering = useMemo(() => {
    const map = new Map<string, number>();
    let n = 0;
    for (const f of def.fields) if (f.type !== "statement") map.set(f.id, ++n);
    return map;
  }, [def.fields]);

  const current = stage.kind === "field" ? def.fields[fieldIndex.get(stage.id) ?? -1] : undefined;

  const progress = useMemo(() => {
    if (stage.kind === "ending") return 1;
    if (stage.kind !== "field") return 0;
    const path = visiblePath(def, answers);
    const i = path.indexOf(stage.id);
    if (i < 0 || !path.length) return 0;
    return i / path.length;
  }, [def, answers, stage]);

  const setAnswer = (id: string, v: AnswerValue) => {
    if (startedAt.current === null) {
      startedAt.current = Date.now();
      track("start");
    }
    setError(null);
    const next = { ...answersRef.current };
    if (v === null) delete next[id];
    else next[id] = v;
    answersRef.current = next;
    setAnswers(next);
  };

  const goTo = (s: Stage, dir: 1 | -1) => {
    // Drop focus so keystrokes during the exit animation don't land in the old input.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setDirection(dir);
    setError(null);
    setStage(s);
  };

  const submit = async (endingId: string, finalAnswers: Answers) => {
    if (!live) {
      goTo({ kind: "ending", id: endingId }, 1);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/f/${slug}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          hidden,
          startedAt: startedAt.current,
          visitor: visitor.current,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fieldId?: string; endingId?: string };
      if (!res.ok) {
        if (data.fieldId && fieldIndex.has(data.fieldId)) {
          goTo({ kind: "field", id: data.fieldId }, -1);
          setError(data.error ?? "Please check this answer");
        } else setSubmitError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      goTo({ kind: "ending", id: data.endingId ?? endingId }, 1);
    } catch {
      setSubmitError("You appear to be offline. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const advance = (fresh?: AnswerValue) => {
    if (busy.current || submitting) return;
    if (stage.kind === "welcome") {
      if (def.fields[0]) goTo({ kind: "field", id: def.fields[0].id }, 1);
      else submit(def.endings[0]?.id, {});
      return;
    }
    if (stage.kind !== "field" || !current) return;
    const snapshot = { ...answersRef.current };
    if (fresh !== undefined) {
      if (fresh === null) delete snapshot[current.id];
      else snapshot[current.id] = fresh;
    }
    const err = validateAnswer(current, snapshot[current.id]);
    if (err) {
      setError(err);
      setShake((s) => s + 1);
      return;
    }
    const step = nextStep(def, current.id, snapshot);
    setHistory((h) => [...h, current.id]);
    if (step.kind === "field") goTo(step, 1);
    else {
      // Only submit answers that lie on the path actually taken.
      const path = new Set(visiblePath(def, snapshot));
      const clean = Object.fromEntries(Object.entries(snapshot).filter(([k]) => path.has(k)));
      submit(step.id, clean);
    }
    busy.current = true;
    setTimeout(() => (busy.current = false), 350);
  };

  const back = () => {
    if (stage.kind !== "field") return;
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      goTo({ kind: "field", id: prev }, -1);
    } else if (def.welcome.enabled) goTo({ kind: "welcome" }, -1);
  };

  const restart = () => {
    answersRef.current = {};
    setAnswers({});
    setHistory([]);
    startedAt.current = null;
    goTo(firstStage(), -1);
  };

  // Global Enter handling. Inputs that consume Enter call preventDefault first.
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.key !== "Enter" || e.isComposing) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" && e.shiftKey) return;
      if (t.tagName === "BUTTON" || t.tagName === "A") return;
      e.preventDefault();
      advanceRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Ending redirect
  const ending = stage.kind === "ending" ? (def.endings.find((e) => e.id === stage.id) ?? def.endings[0]) : undefined;
  useEffect(() => {
    if (!ending?.redirectUrl || mode === "preview") return;
    const t = setTimeout(() => {
      const target = mode === "embed" ? window.top ?? window : window;
      try {
        target.location.href = ending.redirectUrl!;
      } catch {
        window.location.href = ending.redirectUrl!;
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [ending, mode]);

  const r = (text: string) => recall(text, def, answers, hidden);
  const theme = def.theme;
  const dark = isDark(theme.background);

  const variants = {
    enter: (d: number) => ({ opacity: 0, y: d * 48 }),
    center: { opacity: 1, y: 0 },
    exit: (d: number) => ({ opacity: 0, y: d * -48 }),
  };

  const stageKey = stage.kind === "field" || stage.kind === "ending" ? `${stage.kind}:${stage.id}` : stage.kind;

  let screen: React.ReactNode = null;
  if (stage.kind === "closed") {
    screen = (
      <ScreenLayout align={theme.align}>
        <QuestionHeading title={<RichText text={closedMessage ?? def.settings.closedMessage} />} />
      </ScreenLayout>
    );
  } else if (stage.kind === "welcome") {
    screen = (
      <ScreenLayout attachment={def.welcome.attachment} align={theme.align}>
        <QuestionHeading
          title={<RichText text={r(def.welcome.title)} />}
          description={def.welcome.description ? <RichText text={r(def.welcome.description)} /> : undefined}
        />
        <ActionButton label={def.welcome.buttonText || "Start"} onClick={() => advance()} showCheck={false} />
        {def.fields.length ? (
          <p className="fl-hint mt-4 flex items-center gap-1.5 text-sm">
            <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.6 3.2v3.5l2.7 1.6-.6 1-3.3-2V4.2h1.2Z" />
            </svg>
            Takes {Math.max(1, Math.round(def.fields.length * 0.15))} minute
            {Math.round(def.fields.length * 0.15) > 1 ? "s" : ""}
          </p>
        ) : null}
      </ScreenLayout>
    );
  } else if (stage.kind === "field" && current) {
    const showOk = current.type === "statement" || !autoAdvances(current) || answers[current.id] !== undefined;
    const isLast = nextStep(def, current.id, answers).kind === "ending";
    screen = (
      <ScreenLayout attachment={current.attachment} align={theme.align}>
        <QuestionHeading
          number={def.settings.showNumbers && current.type !== "statement" ? numbering.get(current.id) : undefined}
          required={current.required && current.type !== "statement"}
          title={<RichText text={r(current.title) || "…"} />}
          description={current.description ? <RichText text={r(current.description)} /> : undefined}
        />
        <motion.div
          key={shake}
          animate={shake ? { x: [0, -10, 9, -6, 4, 0] } : undefined}
          transition={{ duration: 0.4 }}
          className="fl-answer"
        >
          <FieldInput
            field={current}
            value={answers[current.id]}
            onChange={(v) => setAnswer(current.id, v)}
            onAdvance={(fresh) => advance(fresh)}
            active
          />
        </motion.div>
        <AnimatePresence mode="popLayout">
          {error ? (
            <motion.div
              key={error}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fl-error"
              role="alert"
            >
              <AlertTriangle className="size-4" /> {error}
            </motion.div>
          ) : null}
        </AnimatePresence>
        {submitError ? (
          <div className="fl-error" role="alert">
            <AlertTriangle className="size-4" /> {submitError}
          </div>
        ) : null}
        {showOk && !error ? (
          <ActionButton
            label={
              current.type === "statement"
                ? current.properties.buttonText || "Continue"
                : isLast
                  ? "Submit"
                  : "OK"
            }
            showCheck={current.type !== "statement" && !isLast}
            onClick={() => advance()}
            loading={submitting}
          />
        ) : null}
      </ScreenLayout>
    );
  } else if (stage.kind === "ending" && ending) {
    screen = (
      <ScreenLayout attachment={ending.attachment} align={theme.align}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          className="fl-done-badge"
        >
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.6}>
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.45 }}
            />
          </svg>
        </motion.div>
        <QuestionHeading
          title={<RichText text={r(ending.title)} />}
          description={ending.description ? <RichText text={r(ending.description)} /> : undefined}
        />
        {ending.buttonText && ending.buttonUrl ? (
          <div className="fl-actions">
            <a className="fl-button" href={ending.buttonUrl} target="_top">
              {ending.buttonText}
            </a>
          </div>
        ) : null}
        {ending.redirectUrl && mode !== "preview" ? <p className="fl-hint mt-6 text-sm">Redirecting…</p> : null}
        {mode === "preview" ? (
          <button type="button" className="fl-ghost mt-8" onClick={restart}>
            <RotateCcw className="size-4" /> Restart preview
          </button>
        ) : null}
      </ScreenLayout>
    );
  }

  const canGoBack = def.settings.allowBack && stage.kind === "field" && (history.length > 0 || def.welcome.enabled);

  return (
    <div
      className={`fl-root ${dark ? "is-dark" : ""} ${contained ? "is-contained" : ""} ${mode === "embed" ? "is-embed" : ""}`}
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

      {def.settings.showProgress && stage.kind === "field" ? (
        <div className="fl-progress" aria-hidden>
          <motion.div
            className="fl-progress-bar"
            animate={{ width: `${Math.max(progress * 100, 2)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 24 }}
          />
        </div>
      ) : null}

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={stageKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fl-stage"
        >
          {screen}
        </motion.div>
      </AnimatePresence>

      <div className="fl-footer">
        {def.settings.showBranding ? (
          <a className="fl-brand" href="/" target="_blank" rel="noreferrer">
            Made with <b>Formloom</b>
          </a>
        ) : (
          <span />
        )}
        {stage.kind === "field" ? (
          <div className="fl-nav">
            <button type="button" onClick={back} disabled={!canGoBack} aria-label="Previous question">
              <ChevronUp className="size-5" />
            </button>
            <button type="button" onClick={() => advance()} aria-label="Next question">
              <ChevronDown className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
      {mode === "preview" && !hidePreviewTag ? <div className="fl-preview-tag">Preview — responses are not saved</div> : null}
    </div>
  );
}

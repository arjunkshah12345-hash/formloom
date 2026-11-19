"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { publish as publishAction, saveFormDraft, unpublish as unpublishAction } from "@/lib/actions/forms";
import type { FormDefinition } from "@/lib/schema";

export function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (v && typeof v === "object") {
    const entries = Object.entries(v as Record<string, unknown>)
      .filter(([, x]) => x !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : 1));
    return `{${entries.map(([k, x]) => `${JSON.stringify(k)}:${stableStringify(x)}`).join(",")}}`;
  }
  return JSON.stringify(v);
}

type SaveState = "saved" | "saving" | "unsaved" | "error";

type Workspace = {
  formId: string;
  slug: string;
  def: FormDefinition;
  update: (fn: (d: FormDefinition) => FormDefinition, opts?: { coalesce?: string }) => void;
  saveState: SaveState;
  isPublished: boolean;
  hasUnpublished: boolean;
  publish: () => Promise<{ error?: string }>;
  unpublish: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  appUrl: string;
  flush: () => Promise<void>;
};

const Ctx = createContext<Workspace | null>(null);

export function useWorkspace() {
  const ws = useContext(Ctx);
  if (!ws) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ws;
}

export function WorkspaceProvider({
  formId,
  slug,
  initial,
  published,
  appUrl,
  children,
}: {
  formId: string;
  slug: string;
  initial: FormDefinition;
  published: FormDefinition | null;
  appUrl: string;
  children: ReactNode;
}) {
  const [def, setDef] = useState(initial);
  const [publishedKey, setPublishedKey] = useState(published ? stableStringify(published) : null);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const past = useRef<FormDefinition[]>([]);
  const future = useRef<FormDefinition[]>([]);
  const lastCoalesce = useRef<{ key: string; at: number } | null>(null);
  const [counts, setCounts] = useState({ past: 0, future: 0 });
  const syncCounts = () => setCounts({ past: past.current.length, future: future.current.length });
  const savedKey = useRef(stableStringify(initial));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(def);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const snapshot = latest.current;
    const key = stableStringify(snapshot);
    if (key === savedKey.current) {
      setSaveState("saved");
      return;
    }
    setSaveState("saving");
    try {
      await saveFormDraft(formId, snapshot);
      savedKey.current = key;
      setSaveState(stableStringify(latest.current) === key ? "saved" : "unsaved");
    } catch {
      setSaveState("error");
    }
  }, [formId]);

  const schedule = useCallback(() => {
    setSaveState("unsaved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 700);
  }, [flush]);

  const update = useCallback<Workspace["update"]>(
    (fn, opts) => {
      // Compute outside the state updater so history bookkeeping runs exactly once.
      const prev = latest.current;
      const next = fn(prev);
      if (next === prev) return;
      const now = Date.now();
      const c = lastCoalesce.current;
      const merge = opts?.coalesce && c && c.key === opts.coalesce && now - c.at < 1200;
      if (!merge) {
        past.current.push(prev);
        if (past.current.length > 100) past.current.shift();
      }
      lastCoalesce.current = opts?.coalesce ? { key: opts.coalesce, at: now } : null;
      future.current = [];
      latest.current = next;
      setDef(next);
      syncCounts();
      schedule();
    },
    [schedule],
  );

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(latest.current);
    lastCoalesce.current = null;
    latest.current = prev;
    setDef(prev);
    syncCounts();
    schedule();
  }, [schedule]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(latest.current);
    lastCoalesce.current = null;
    latest.current = next;
    setDef(next);
    syncCounts();
    schedule();
  }, [schedule]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (stableStringify(latest.current) !== savedKey.current) {
        flush();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [flush]);

  const defKey = useMemo(() => stableStringify(def), [def]);

  const value: Workspace = {
    formId,
    slug,
    def,
    update,
    saveState,
    isPublished: publishedKey !== null,
    hasUnpublished: publishedKey !== null && publishedKey !== defKey,
    publish: async () => {
      if (timer.current) clearTimeout(timer.current);
      const snapshot = latest.current;
      const res = await publishAction(formId, snapshot);
      if (res.error) return { error: res.error };
      savedKey.current = stableStringify(snapshot);
      setSaveState("saved");
      setPublishedKey(stableStringify(snapshot));
      return {};
    },
    unpublish: async () => {
      await unpublishAction(formId);
      setPublishedKey(null);
    },
    undo,
    redo,
    canUndo: counts.past > 0,
    canRedo: counts.future > 0,
    appUrl,
    flush,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, CloudOff, Eye, Loader2, Redo2, Rocket, Undo2 } from "lucide-react";
import { useToast } from "@/components/ui";
import { LogoMark } from "@/components/app/Logo";
import { useWorkspace } from "./workspace";

const TABS = [
  { href: "edit", label: "Create" },
  { href: "settings", label: "Settings" },
  { href: "share", label: "Share" },
  { href: "results", label: "Results" },
];

export function TopBar() {
  const ws = useWorkspace();
  const pathname = usePathname();
  const toast = useToast();
  const [publishing, setPublishing] = useState(false);
  const active = pathname.split("/")[3] ?? "edit";

  const onPublish = async () => {
    setPublishing(true);
    const res = await ws.publish();
    setPublishing(false);
    if (res.error) toast(res.error, "error");
    else toast(ws.isPublished ? "Changes published 🚀" : "Your form is live 🚀");
  };

  return (
    <header className="z-30 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-line bg-surface px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link href="/forms" className="btn-ghost size-9 shrink-0 p-0" aria-label="Back to forms">
          <ArrowLeft className="size-4" />
        </Link>
        <LogoMark className="size-6 shrink-0 max-sm:hidden" />
        <input
          className="h-8 min-w-0 max-w-64 flex-1 truncate rounded-md bg-transparent px-2 text-sm font-medium outline-none hover:bg-ink/[0.06] focus:bg-ink/[0.06]"
          value={ws.def.title}
          onChange={(e) => ws.update((d) => ({ ...d, title: e.target.value }), { coalesce: "title" })}
          aria-label="Form title"
        />
        <SaveIndicator />
      </div>

      <nav className="flex items-center gap-0.5 rounded-lg bg-ink/[0.06] p-0.5">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={`/forms/${ws.formId}/${t.href}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active === t.href ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-end gap-1.5">
        {active === "edit" ? (
          <div className="mr-1 hidden items-center md:flex">
            <button className="btn-ghost size-8 p-0" onClick={ws.undo} disabled={!ws.canUndo} title="Undo (⌘Z)">
              <Undo2 className="size-4" />
            </button>
            <button className="btn-ghost size-8 p-0" onClick={ws.redo} disabled={!ws.canRedo} title="Redo (⌘⇧Z)">
              <Redo2 className="size-4" />
            </button>
          </div>
        ) : null}
        <a
          href={`/preview/${ws.formId}`}
          target="_blank"
          rel="noreferrer"
          className="btn-outline"
          title="Preview"
          onClick={async (e) => {
            e.preventDefault();
            const w = window.open("about:blank", "_blank");
            await ws.flush();
            if (w) w.location.href = `/preview/${ws.formId}`;
          }}
        >
          <Eye className="size-4" />
          <span className="max-md:hidden">Preview</span>
        </a>
        {ws.isPublished && !ws.hasUnpublished ? (
          <Link href={`/forms/${ws.formId}/share`} className="btn-outline text-ok">
            <span className="size-2 rounded-full bg-emerald-500/120" />
            <span className="max-md:hidden">Live</span>
          </Link>
        ) : (
          <button className="btn-accent" onClick={onPublish} disabled={publishing}>
            {publishing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
            {ws.isPublished ? "Publish changes" : "Publish"}
          </button>
        )}
      </div>
    </header>
  );
}

function SaveIndicator() {
  const { saveState } = useWorkspace();
  return (
    <span className="hidden shrink-0 items-center gap-1 text-xs text-ink-3 lg:inline-flex">
      {saveState === "saving" || saveState === "unsaved" ? (
        <>
          <Loader2 className="size-3 animate-spin" /> Saving
        </>
      ) : saveState === "error" ? (
        <span className="inline-flex items-center gap-1 text-red-400">
          <CloudOff className="size-3" /> Not saved
        </span>
      ) : (
        <>
          <Check className="size-3" /> Saved
        </>
      )}
    </span>
  );
}

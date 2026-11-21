"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  BarChart3,
  Copy,
  ExternalLink,
  FileUp,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { createFromTemplate, duplicate, importForm, removeForm } from "@/lib/actions/forms";
import type { FormListItem } from "@/lib/forms";
import type { Theme } from "@/lib/schema";
import { timeAgo } from "@/lib/format";
import { Dialog, Menu, MenuItem, useToast } from "@/components/ui";
import { ThemeThumb } from "./ThemeThumb";

type TemplateInfo = { key: string; name: string; description: string; theme: Theme; sample: string };

export function FormsGrid({
  forms,
  templates,
  greeting,
  totalResponses,
}: {
  forms: FormListItem[];
  templates: TemplateInfo[];
  greeting: string;
  totalResponses: number;
}) {
  const [newOpen, setNewOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<FormListItem | null>(null);
  const [pending, start] = useTransition();
  const [creating, setCreating] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const filtered = forms.filter((f) => f.title.toLowerCase().includes(query.toLowerCase()));

  const create = (key: string) => {
    setCreating(key);
    start(() => createFromTemplate(key));
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    start(async () => {
      const res = await importForm(text);
      if (res?.error) toast(res.error, "error");
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-3">{greeting} 👋</p>
          <h1 className="mt-1 font-heading text-5xl font-medium tracking-[-0.04em]">Your forms</h1>
          <p className="mt-2 text-sm text-ink-2">
            {forms.length} form{forms.length === 1 ? "" : "s"} · {totalResponses.toLocaleString()} response
            {totalResponses === 1 ? "" : "s"} collected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
          <button className="btn-outline" onClick={() => fileRef.current?.click()} disabled={pending}>
            <FileUp className="size-4" /> Import
          </button>
          <button className="btn-primary" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" /> New form
          </button>
        </div>
      </div>

      {forms.length > 3 ? (
        <div className="relative mt-8 max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <input className="input pl-9" placeholder="Search forms" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      ) : null}

      {forms.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line-2 bg-surface/50 px-6 py-16 text-center">
          <p className="font-heading text-3xl font-medium tracking-[-0.03em]">Nothing here yet</p>
          <p className="mt-2 text-sm text-ink-2">Start from a template or a blank canvas — it takes seconds.</p>
          <button className="btn-primary mt-6" onClick={() => setNewOpen(true)}>
            <Plus className="size-4" /> Create your first form
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setNewOpen(true)}
            className="group flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-2 text-ink-2 transition hover:border-ink-3 hover:bg-surface hover:text-ink"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-ink text-paper transition group-hover:scale-105">
              <Plus className="size-5" />
            </span>
            <span className="text-sm font-medium">New form</span>
          </button>
          {filtered.map((f) => (
            <article key={f.id} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,.18)]">
              <Link href={`/forms/${f.id}/edit`} className="block">
                <ThemeThumb theme={f.theme} title={f.title} className="h-40 border-b border-line" />
              </Link>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/forms/${f.id}/edit`} className="block truncate font-medium hover:underline">
                    {f.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-3">
                    <StatusBadge form={f} />
                    <span>{f.fieldCount} questions</span>
                    <span>·</span>
                    <span>Edited {timeAgo(f.updatedAt)}</span>
                  </div>
                </div>
                <Menu
                  trigger={({ onClick }) => (
                    <button className="btn-ghost size-8 shrink-0 p-0" onClick={onClick} aria-label="Form actions">
                      <MoreHorizontal className="size-4" />
                    </button>
                  )}
                >
                  {(close) => (
                    <>
                      <Link href={`/forms/${f.id}/edit`} onClick={close}>
                        <MenuItem icon={<Pencil />}>Edit</MenuItem>
                      </Link>
                      <Link href={`/forms/${f.id}/results`} onClick={close}>
                        <MenuItem icon={<BarChart3 />}>Results</MenuItem>
                      </Link>
                      <Link href={`/forms/${f.id}/share`} onClick={close}>
                        <MenuItem icon={<Share2 />}>Share</MenuItem>
                      </Link>
                      {f.isPublished ? (
                        <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer" onClick={close}>
                          <MenuItem icon={<ExternalLink />}>Open live form</MenuItem>
                        </a>
                      ) : null}
                      <MenuItem
                        icon={<Copy />}
                        onClick={() => {
                          close();
                          start(async () => {
                            await duplicate(f.id);
                            toast("Form duplicated");
                          });
                        }}
                      >
                        Duplicate
                      </MenuItem>
                      <div className="my-1 h-px bg-line" />
                      <MenuItem
                        icon={<Trash2 />}
                        danger
                        onClick={() => {
                          close();
                          setConfirmDelete(f);
                        }}
                      >
                        Delete
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </div>
              <Link
                href={`/forms/${f.id}/results`}
                className="flex items-center justify-between border-t border-line px-4 py-2.5 text-sm transition hover:bg-paper"
              >
                <span className="text-ink-2">
                  <b className="font-semibold text-ink tabular-nums">{f.responseCount.toLocaleString()}</b> responses
                </span>
                <span className="text-xs text-ink-3">
                  {f.lastResponseAt ? `Last ${timeAgo(f.lastResponseAt)}` : "No responses yet"}
                </span>
              </Link>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        wide
        title="Create a form"
        description="Pick a starting point. Everything is editable."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.key}
              disabled={pending}
              onClick={() => create(t.key)}
              className="group overflow-hidden rounded-xl border border-line text-left transition hover:border-ink-3 hover:shadow-md disabled:opacity-60"
            >
              {t.key === "blank" ? (
                <div className="flex h-32 items-center justify-center border-b border-line bg-paper dot-grid">
                  <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
                    <Plus className="size-5" />
                  </span>
                </div>
              ) : (
                <ThemeThumb theme={t.theme} title={t.sample} className="h-32 border-b border-line" />
              )}
              <div className="p-3.5">
                <p className="text-sm font-medium">
                  {creating === t.key && pending ? "Creating…" : t.name}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete this form?"
        description={
          confirmDelete
            ? `“${confirmDelete.title}” and its ${confirmDelete.responseCount} responses will be permanently deleted.`
            : ""
        }
      >
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </button>
          <button
            className="btn-danger"
            disabled={pending}
            onClick={() => {
              const f = confirmDelete!;
              start(async () => {
                await removeForm(f.id);
                setConfirmDelete(null);
                toast("Form deleted");
              });
            }}
          >
            Delete forever
          </button>
        </div>
      </Dialog>
    </>
  );
}

function StatusBadge({ form }: { form: FormListItem }) {
  if (!form.isPublished)
    return <span className="rounded-full bg-ink/[0.08] px-2 py-0.5 font-medium text-ink-2">Draft</span>;
  if (form.isClosed)
    return <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-300">Closed</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 font-medium text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500/120" />
      Live{form.hasChanges ? " · edits" : ""}
    </span>
  );
}

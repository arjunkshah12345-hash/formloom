"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Download, Inbox, Monitor, Search, Smartphone, Star, Trash2, X } from "lucide-react";
import { formatAnswer, recallLabels } from "@/lib/engine";
import type { ResponseRow } from "@/lib/forms";
import { removeResponses } from "@/lib/actions/forms";
import { RANGES, type RangeKey } from "@/lib/range";
import type { FormDefinition } from "@/lib/schema";
import type { FieldSummary } from "@/lib/summary";
import { duration, pct, timeAgo } from "@/lib/format";
import { TypeIcon } from "@/components/builder/TypeIcon";
import { Dialog, Segmented, useToast } from "@/components/ui";

type Stats = {
  views: number;
  starts: number;
  submissions: number;
  avgDurationMs: number | null;
  reach: Record<string, number>;
};

export function ResultsView({
  formId,
  def,
  range,
  view,
  stats,
  summary,
  responses,
  isPublished,
}: {
  formId: string;
  def: FormDefinition;
  range: RangeKey;
  view: "summary" | "responses";
  stats: Stats;
  summary: FieldSummary[];
  responses: ResponseRow[];
  isPublished: boolean;
}) {
  const router = useRouter();
  const nav = (patch: { range?: string; view?: string }) => {
    const p = new URLSearchParams({ range, view, ...patch });
    router.push(`/forms/${formId}/results?${p}`, { scroll: false });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={view}
            onChange={(v) => nav({ view: v })}
            options={[
              { value: "summary", label: "Summary" },
              { value: "responses", label: `Responses (${responses.length})` },
            ]}
          />
          <div className="flex items-center gap-2">
            <select className="input h-9 w-auto" value={range} onChange={(e) => nav({ range: e.target.value })}>
              {Object.entries(RANGES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <a className="btn-outline" href={`/api/forms/${formId}/export?range=${range}`}>
              <Download className="size-4" /> Export CSV
            </a>
          </div>
        </div>

        {!responses.length && !stats.views ? (
          <EmptyState formId={formId} isPublished={isPublished} />
        ) : view === "summary" ? (
          <Summary def={def} stats={stats} summary={summary} />
        ) : (
          <ResponsesTable formId={formId} def={def} responses={responses} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ formId, isPublished }: { formId: string; isPublished: boolean }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-line-2 px-6 py-20 text-center">
      <Inbox className="mx-auto size-8 text-ink-3" />
      <p className="mt-4 font-display text-3xl">No responses yet</p>
      <p className="mt-2 text-sm text-ink-2">
        {isPublished ? "Share your form to start collecting answers." : "Publish your form, then share the link."}
      </p>
      <Link href={`/forms/${formId}/share`} className="btn-primary mt-6">
        Go to Share
      </Link>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-ink-3">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

function Summary({ def, stats, summary }: { def: FormDefinition; stats: Stats; summary: FieldSummary[] }) {
  const funnel = def.fields.map((f, i) => ({ field: f, i, n: stats.reach[f.id] ?? 0 }));
  const top = Math.max(stats.starts, ...funnel.map((x) => x.n), 1);
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Views" value={stats.views.toLocaleString()} />
        <Kpi label="Starts" value={stats.starts.toLocaleString()} hint={`${pct(stats.starts, stats.views)} of views`} />
        <Kpi label="Submissions" value={stats.submissions.toLocaleString()} />
        <Kpi label="Completion rate" value={pct(stats.submissions, stats.views)} hint="Submissions ÷ views" />
        <Kpi label="Avg. time to complete" value={duration(stats.avgDurationMs)} />
      </div>

      {funnel.length && stats.starts ? (
        <section className="card mt-6 p-6">
          <h2 className="font-medium">Drop-off</h2>
          <p className="mt-1 text-sm text-ink-3">How many people reached each question.</p>
          <div className="mt-5 space-y-2">
            {funnel.map(({ field, i, n }) => (
              <div key={field.id} className="grid grid-cols-[minmax(0,220px)_1fr_auto] items-center gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <TypeIcon type={field.type} size="sm" />
                  <span className="truncate text-ink-2">
                    {i + 1}. {recallLabels(field.title, def)}
                  </span>
                </span>
                <span className="h-6 overflow-hidden rounded-md bg-paper">
                  <motion.span
                    className="block h-full rounded-md bg-ink/85"
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / top) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="w-20 text-right text-xs text-ink-3 tabular-nums">
                  {n} · {pct(n, top)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {summary.map((s, i) => (
          <SummaryCard key={s.field.id} s={s} index={i} def={def} />
        ))}
      </div>
    </>
  );
}

function Bar({ label, count, total, accent }: { label: string; count: number; total: number; accent?: string }) {
  const p = total ? count / total : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-ink-3 tabular-nums">
          {Math.round(p * 100)}% · {count}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-paper">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent ?? "var(--ink)" }}
          initial={{ width: 0 }}
          animate={{ width: `${p * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function Columns({ dist, highlight }: { dist: { value: number; count: number }[]; highlight?: (v: number) => string }) {
  const max = Math.max(...dist.map((d) => d.count), 1);
  return (
    <div className="flex h-36 items-end gap-1.5">
      {dist.map((d) => (
        <div key={d.value} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-ink-3 tabular-nums">{d.count || ""}</span>
          <motion.div
            className="w-full rounded-t-md"
            style={{ background: highlight?.(d.value) ?? "var(--ink)" }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.count / max) * 96, d.count ? 4 : 1)}px` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <span className="text-xs text-ink-2 tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ s, index, def }: { s: FieldSummary; index: number; def: FormDefinition }) {
  return (
    <section className={`card p-6 ${s.kind === "text" || s.kind === "nps" ? "" : ""}`}>
      <div className="flex items-start gap-3">
        <TypeIcon type={s.field.type} />
        <div className="min-w-0 flex-1">
          <h3 className="leading-snug font-medium">
            {index + 1}. {recallLabels(s.field.title, def)}
          </h3>
          <p className="mt-0.5 text-xs text-ink-3">{s.answered} answered</p>
        </div>
      </div>
      <div className="mt-5">
        {s.kind === "choices" ? (
          <div className="space-y-3">
            {s.rows
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((r) => (
                <Bar key={r.label} label={r.label} count={r.count} total={s.answered} />
              ))}
            {s.other.length ? (
              <p className="pt-1 text-xs text-ink-3">
                Other: {s.other.slice(0, 6).map((o) => `“${o}”`).join(", ")}
              </p>
            ) : null}
          </div>
        ) : s.kind === "boolean" ? (
          <div className="space-y-3">
            <Bar label={s.field.type === "legal" ? "Accepted" : "Yes"} count={s.yes} total={s.answered} accent="#148a54" />
            <Bar label={s.field.type === "legal" ? "Not accepted" : "No"} count={s.no} total={s.answered} accent="#d4483b" />
          </div>
        ) : s.kind === "scale" ? (
          <>
            <p className="mb-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{s.average?.toFixed(1) ?? "—"}</span>
              <span className="text-sm text-ink-3">average</span>
              {s.field.type === "rating" && s.average ? <Star className="size-4 fill-amber-400 text-amber-400" /> : null}
            </p>
            <Columns dist={s.dist} />
          </>
        ) : s.kind === "nps" ? (
          <>
            <div className="mb-5 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-xs text-ink-3">NPS</p>
                <p className={`text-5xl font-semibold tracking-tight tabular-nums ${(s.nps?.score ?? 0) >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {s.nps ? (s.nps.score > 0 ? `+${s.nps.score}` : s.nps.score) : "—"}
                </p>
              </div>
              {s.nps ? (
                <div className="flex gap-4 text-sm">
                  <span>
                    <b className="text-emerald-700">{pct(s.nps.promoters, s.answered)}</b> <span className="text-ink-3">promoters</span>
                  </span>
                  <span>
                    <b className="text-ink-2">{pct(s.nps.passives, s.answered)}</b> <span className="text-ink-3">passives</span>
                  </span>
                  <span>
                    <b className="text-red-600">{pct(s.nps.detractors, s.answered)}</b> <span className="text-ink-3">detractors</span>
                  </span>
                </div>
              ) : null}
            </div>
            <Columns dist={s.dist} highlight={(v) => (v >= 9 ? "#148a54" : v >= 7 ? "#b6b2a6" : "#d4483b")} />
          </>
        ) : s.kind === "number" ? (
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Average", s.average?.toFixed(1)],
              ["Min", s.min],
              ["Max", s.max],
            ].map(([l, v]) => (
              <div key={String(l)} className="rounded-lg bg-paper p-3">
                <p className="text-xs text-ink-3">{l}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{v ?? "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {s.latest.length ? (
              s.latest.map((x, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                  <span className="line-clamp-3 break-words">{x.text}</span>
                  <span className="shrink-0 text-xs text-ink-3">{timeAgo(x.at)}</span>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-ink-3">No answers yet</li>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

function ResponsesTable({ formId, def, responses }: { formId: string; def: FormDefinition; responses: ResponseRow[] }) {
  const fields = def.fields.filter((f) => f.type !== "statement");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<ResponseRow | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return responses;
    return responses.filter((r) =>
      fields.some((f) => formatAnswer(f, r.answers[f.id]).toLowerCase().includes(q)) ||
      Object.values(r.hidden).some((v) => v.toLowerCase().includes(q)),
    );
  }, [responses, query, fields]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const del = (ids: string[]) =>
    start(async () => {
      await removeResponses(formId, ids);
      setSelected(new Set());
      setOpen(null);
      setConfirm(false);
      toast(`Deleted ${ids.length} response${ids.length > 1 ? "s" : ""}`);
    });

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <input className="input pl-9" placeholder="Search answers" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {selected.size ? (
          <button className="btn-danger" onClick={() => setConfirm(true)}>
            <Trash2 className="size-4" /> Delete {selected.size}
          </button>
        ) : null}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-paper/60 text-xs text-ink-3">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="accent-ink"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                />
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">Submitted</th>
              {fields.map((f) => (
                <th key={f.id} className="max-w-56 min-w-40 px-3 py-2.5 font-medium">
                  <span className="line-clamp-1">{recallLabels(f.title, def)}</span>
                </th>
              ))}
              {def.settings.hiddenFields.map((h) => (
                <th key={h} className="px-3 py-2.5 font-mono font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpen(r)}
                className={`cursor-pointer border-b border-line last:border-0 hover:bg-paper/70 ${selected.has(r.id) ? "bg-accent-soft/40" : ""}`}
              >
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="accent-ink" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-ink-2">{timeAgo(r.submittedAt)}</td>
                {fields.map((f) => (
                  <td key={f.id} className="max-w-56 px-3 py-2.5">
                    <span className="line-clamp-1">{formatAnswer(f, r.answers[f.id]) || <span className="text-ink-3">—</span>}</span>
                  </td>
                ))}
                {def.settings.hiddenFields.map((h) => (
                  <td key={h} className="px-3 py-2.5 font-mono text-xs">
                    {r.hidden[h] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={fields.length + 2} className="px-3 py-10 text-center text-ink-3">
                  No responses match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-lg flex-col border-l border-line bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="font-medium">Response</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
                    {new Date(open.submittedAt).toLocaleString()} · {duration(open.durationMs)}
                    {open.meta.device ? (
                      <>
                        {" · "}
                        {open.meta.device === "mobile" ? <Smartphone className="size-3" /> : <Monitor className="size-3" />}
                        {open.meta.device}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost size-8 p-0 text-red-600" onClick={() => del([open.id])} disabled={pending} aria-label="Delete">
                    <Trash2 className="size-4" />
                  </button>
                  <button className="btn-ghost size-8 p-0" onClick={() => setOpen(null)} aria-label="Close">
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {fields.map((f, i) => (
                  <div key={f.id}>
                    <p className="flex items-center gap-2 text-xs text-ink-3">
                      <TypeIcon type={f.type} size="sm" /> {i + 1}. {recallLabels(f.title, def)}
                    </p>
                    <p className="mt-1.5 pl-7 whitespace-pre-wrap">
                      {formatAnswer(f, open.answers[f.id]) || <span className="text-ink-3">Skipped</span>}
                    </p>
                  </div>
                ))}
                {Object.keys(open.hidden).length ? (
                  <div className="rounded-lg bg-paper p-3">
                    <p className="mb-2 text-xs font-medium text-ink-3">Hidden fields</p>
                    {Object.entries(open.hidden).map(([k, v]) => (
                      <p key={k} className="font-mono text-xs">
                        <span className="text-violet-700">{k}</span> = {v}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Delete ${selected.size} response${selected.size > 1 ? "s" : ""}?`}
        description="This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setConfirm(false)}>
            Cancel
          </button>
          <button className="btn-danger" disabled={pending} onClick={() => del([...selected])}>
            Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
}

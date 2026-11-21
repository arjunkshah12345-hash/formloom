"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, ExternalLink, Lock, Rocket, Unlock } from "lucide-react";
import { setClosed } from "@/lib/actions/forms";
import { Segmented, Toggle, useCopy, useToast } from "@/components/ui";
import { useWorkspace } from "./workspace";

type EmbedKind = "standard" | "fullpage" | "popup";

export function ShareView() {
  const ws = useWorkspace();
  const copy = useCopy();
  const toast = useToast();
  const [qr, setQr] = useState<string>("");
  const [kind, setKind] = useState<EmbedKind>("standard");
  const [height, setHeight] = useState(560);
  const [copied, setCopied] = useState(false);
  const [hiddenValues, setHiddenValues] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);

  const base = `${ws.appUrl}/f/${ws.slug}`;
  const params = new URLSearchParams(Object.entries(hiddenValues).filter(([, v]) => v));
  const url = params.size ? `${base}?${params}` : base;
  const embedUrl = `${base}?embed=1${params.size ? `&${params}` : ""}`;

  useEffect(() => {
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#171612", light: "#ffffff" } }).then(setQr, () => setQr(""));
  }, [url]);

  const snippet =
    kind === "standard"
      ? `<iframe src="${embedUrl}" width="100%" height="${height}" style="border:0;border-radius:12px" allow="clipboard-write" title="${ws.def.title.replace(/"/g, "&quot;")}"></iframe>`
      : kind === "fullpage"
        ? `<!doctype html>\n<html>\n  <head>\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>${ws.def.title}</title>\n    <style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style>\n  </head>\n  <body>\n    <iframe src="${embedUrl}" allow="clipboard-write"></iframe>\n  </body>\n</html>`
        : `<button data-formloom-popup="${embedUrl}">${ws.def.welcome.buttonText || "Open form"}</button>\n<script src="${ws.appUrl}/embed.js" async></script>`;

  if (!ws.isPublished) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Rocket className="size-6" />
          </div>
          <h1 className="mt-5 font-heading text-4xl font-medium tracking-[-0.04em]">Publish to share</h1>
          <p className="mt-2 text-ink-2">Once published, your form gets a public link, an embed code and a QR code.</p>
          <button
            className="btn-accent mt-6 h-10 px-5"
            disabled={publishing}
            onClick={async () => {
              setPublishing(true);
              const r = await ws.publish();
              setPublishing(false);
              if (r.error) toast(r.error, "error");
            }}
          >
            <Rocket className="size-4" /> {publishing ? "Publishing…" : "Publish form"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-5 px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-4xl font-medium tracking-[-0.04em]">Share</h1>
            <p className="mt-1 text-sm text-ink-3">
              {ws.hasUnpublished ? "You have unpublished edits — publish to update the live form." : "Your form is live."}
            </p>
          </div>
          <button
            className="btn-ghost text-xs"
            onClick={async () => {
              await ws.unpublish();
              toast("Form unpublished");
            }}
          >
            Unpublish
          </button>
        </div>

        <section className="card grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <h2 className="font-medium">Link</h2>
            <div className="mt-3 flex gap-2">
              <input readOnly value={url} className="input font-mono text-[13px]" onFocus={(e) => e.target.select()} />
              <button className="btn-primary" onClick={() => copy(url, "Link copied")}>
                <Copy className="size-4" /> Copy
              </button>
              <a className="btn-outline" href={url} target="_blank" rel="noreferrer" aria-label="Open">
                <ExternalLink className="size-4" />
              </a>
            </div>
            {ws.def.settings.hiddenFields.length ? (
              <div className="mt-5">
                <p className="label">Hidden field values</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ws.def.settings.hiddenFields.map((h) => (
                    <div key={h} className="flex items-center rounded-lg border border-line-2 bg-surface pl-3">
                      <span className="font-mono text-xs text-violet-700">{h}=</span>
                      <input
                        className="h-9 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
                        placeholder="value"
                        value={hiddenValues[h] ?? ""}
                        onChange={(e) => setHiddenValues((v) => ({ ...v, [h]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-5 border-t border-line pt-4">
              <Toggle
                label={ws.def.settings.isClosed ? "Form is closed" : "Accepting responses"}
                description={ws.def.settings.isClosed ? "Visitors see your closed message." : "Turn off to close the form instantly."}
                checked={!ws.def.settings.isClosed}
                onChange={async (open) => {
                  ws.update((d) => ({ ...d, settings: { ...d.settings, isClosed: !open } }));
                  await setClosed(ws.formId, !open);
                  toast(open ? "Form reopened" : "Form closed");
                }}
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="QR code" className="size-40 rounded-lg border border-line" />
            ) : (
              <div className="size-40 rounded-lg bg-paper" />
            )}
            <a href={qr} download={`${ws.slug}-qr.png`} className="btn-ghost h-7 text-xs">
              <Download className="size-3.5" /> Download QR
            </a>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-medium">Embed</h2>
            <Segmented
              value={kind}
              onChange={setKind}
              options={[
                { value: "standard", label: "Inline" },
                { value: "fullpage", label: "Full page" },
                { value: "popup", label: "Popup" },
              ]}
            />
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <EmbedPreview kind={kind} theme={ws.def.theme} />
            <div className="min-w-0">
              {kind === "standard" ? (
                <div className="mb-3">
                  <label className="label">Height: {height}px</label>
                  <input type="range" min={360} max={900} step={20} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-ink" />
                </div>
              ) : null}
              <div className="relative">
                <pre className="max-h-64 overflow-auto rounded-xl border border-line bg-black/50 p-4 pr-12 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all text-ink-2">
                  {snippet}
                </pre>
                <button
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-md bg-white/10 text-ink hover:bg-white/20"
                  onClick={() => {
                    copy(snippet, "Embed code copied");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  aria-label="Copy code"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                {kind === "popup"
                  ? "Any element with data-formloom-popup opens the form in a modal."
                  : "Paste this into any HTML page, Webflow, WordPress, Notion embed…"}
              </p>
            </div>
          </div>
        </section>

        <section className="card flex items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-medium">Status</h2>
            <p className="mt-1 text-sm text-ink-3">
              {ws.def.settings.isClosed ? (
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5" /> Closed to new responses
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Unlock className="size-3.5" /> Open — {ws.def.settings.responseLimit ? `limited to ${ws.def.settings.responseLimit} responses` : "no response limit"}
                </span>
              )}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmbedPreview({ kind, theme }: { kind: EmbedKind; theme: { background: string; button: string; answer: string } }) {
  return (
    <div className="flex aspect-[4/3] flex-col overflow-hidden rounded-xl border border-line bg-paper">
      <div className="flex gap-1 border-b border-line bg-surface px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-line-2" />
        ))}
      </div>
      <div className="relative flex-1 p-4">
        {kind === "fullpage" ? (
          <div className="absolute inset-0" style={{ background: theme.background }}>
            <div className="m-6 h-3 w-1/2 rounded" style={{ background: theme.answer, opacity: 0.4 }} />
            <div className="mx-6 h-6 w-16 rounded" style={{ background: theme.button }} />
          </div>
        ) : (
          <>
            <div className="h-2.5 w-2/3 rounded bg-line-2" />
            <div className="mt-2 h-2.5 w-1/2 rounded bg-line" />
            {kind === "standard" ? (
              <div className="mt-4 h-[55%] rounded-lg p-4" style={{ background: theme.background }}>
                <div className="h-2.5 w-1/2 rounded" style={{ background: theme.answer, opacity: 0.5 }} />
                <div className="mt-3 h-5 w-14 rounded" style={{ background: theme.button }} />
              </div>
            ) : (
              <>
                <div className="mt-4 h-7 w-24 rounded-md bg-ink" />
                <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                  <div className="h-3/4 w-3/4 rounded-lg p-4 shadow-xl" style={{ background: theme.background }}>
                    <div className="h-2.5 w-1/2 rounded" style={{ background: theme.answer, opacity: 0.5 }} />
                    <div className="mt-3 h-5 w-14 rounded" style={{ background: theme.button }} />
                  </div>
                </div>
              </>
            )}
            <div className="mt-4 h-2.5 w-3/5 rounded bg-line" />
          </>
        )}
      </div>
    </div>
  );
}

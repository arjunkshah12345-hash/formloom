"use client";

import { useState } from "react";
import { Download, KeyRound, Send, X } from "lucide-react";
import { sendTestWebhook } from "@/lib/actions/webhooks";
import type { FormSettings } from "@/lib/schema";
import { Toggle, useToast } from "@/components/ui";
import { useWorkspace } from "./workspace";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="font-medium">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-3">{description}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsView({
  deliveries,
}: {
  deliveries: { id: string; status: number | null; error: string | null; createdAt: number; url: string }[];
}) {
  const { def, update, formId } = useWorkspace();
  const s = def.settings;
  const toast = useToast();
  const [hiddenDraft, setHiddenDraft] = useState("");
  const [testing, setTesting] = useState(false);
  const set = (patch: Partial<FormSettings>, key = "settings") =>
    update((d) => ({ ...d, settings: { ...d.settings, ...patch } }), { coalesce: key });

  const addHidden = () => {
    const key = hiddenDraft.trim().replace(/[^\w-]/g, "_");
    if (key && !s.hiddenFields.includes(key)) set({ hiddenFields: [...s.hiddenFields, key] });
    setHiddenDraft("");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${def.title.replace(/[^\w-]+/g, "-").toLowerCase() || "form"}.formloom.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-5 px-5 py-10">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-ink-3">Changes save automatically. Publish to apply them to the live form.</p>
        </div>

        <Card title="Experience">
          <Toggle label="Progress bar" description="Show how far along respondents are." checked={s.showProgress} onChange={(v) => set({ showProgress: v })} />
          <Toggle label="Question numbers" checked={s.showNumbers} onChange={(v) => set({ showNumbers: v })} />
          <Toggle label="Allow going back" description="Show the previous-question arrow." checked={s.allowBack} onChange={(v) => set({ allowBack: v })} />
          <Toggle label="“Made with Formloom” badge" checked={s.showBranding} onChange={(v) => set({ showBranding: v })} />
        </Card>

        <Card title="Access" description="Control when this form accepts responses.">
          <Toggle
            label="Close form"
            description="Stop accepting new responses right away."
            checked={s.isClosed}
            onChange={(v) => set({ isClosed: v })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Response limit</label>
              <input
                type="number"
                min={1}
                className="input"
                placeholder="Unlimited"
                value={s.responseLimit ?? ""}
                onChange={(e) => set({ responseLimit: e.target.value ? Number(e.target.value) : undefined }, "limit")}
              />
            </div>
            <div>
              <label className="label">Close on date</label>
              <input
                type="datetime-local"
                className="input"
                value={s.closeAt ? s.closeAt.slice(0, 16) : ""}
                onChange={(e) => set({ closeAt: e.target.value ? new Date(e.target.value).toISOString() : undefined }, "closeAt")}
              />
            </div>
          </div>
          <div>
            <label className="label">Message when closed</label>
            <textarea className="input" rows={2} value={s.closedMessage} onChange={(e) => set({ closedMessage: e.target.value }, "closedMsg")} />
          </div>
        </Card>

        <Card
          title="Hidden fields"
          description="Pass data through the URL (e.g. ?source=newsletter). Values are stored with each response and can be recalled in questions."
        >
          <div className="flex flex-wrap gap-2">
            {s.hiddenFields.map((h) => (
              <span key={h} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 py-1 pr-1.5 pl-3 font-mono text-xs text-violet-800">
                {h}
                <button onClick={() => set({ hiddenFields: s.hiddenFields.filter((x) => x !== h) })} aria-label={`Remove ${h}`}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input font-mono"
              placeholder="field_name"
              value={hiddenDraft}
              onChange={(e) => setHiddenDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHidden()}
            />
            <button className="btn-outline" onClick={addHidden}>
              Add
            </button>
          </div>
        </Card>

        <Card title="Webhook" description="We'll POST every new response as JSON to this URL, retrying on failures.">
          <div>
            <label className="label">Endpoint URL</label>
            <input
              className="input font-mono"
              placeholder="https://example.com/hooks/formloom"
              value={s.webhookUrl ?? ""}
              onChange={(e) => set({ webhookUrl: e.target.value || undefined }, "wh")}
            />
          </div>
          <div>
            <label className="label">Signing secret (optional)</label>
            <div className="flex gap-2">
              <input
                className="input font-mono"
                placeholder="Used to sign X-Formloom-Signature"
                value={s.webhookSecret ?? ""}
                onChange={(e) => set({ webhookSecret: e.target.value || undefined }, "whs")}
              />
              <button
                className="btn-outline"
                title="Generate"
                onClick={() => {
                  const bytes = crypto.getRandomValues(new Uint8Array(24));
                  set({ webhookSecret: "whsec_" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("") });
                }}
              >
                <KeyRound className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-ink-3">
              Signature is <code className="font-mono">sha256=HMAC_SHA256(secret, rawBody)</code> in hex.
            </p>
          </div>
          <button
            className="btn-outline"
            disabled={!s.webhookUrl || testing}
            onClick={async () => {
              setTesting(true);
              const res = await sendTestWebhook(formId, def);
              setTesting(false);
              toast(res.ok ? `Test delivered (HTTP ${res.status})` : `Test failed: ${res.error}`, res.ok ? "default" : "error");
            }}
          >
            <Send className="size-4" /> {testing ? "Sending…" : "Send test event"}
          </button>
          {deliveries.length ? (
            <div className="rounded-lg border border-line">
              <p className="border-b border-line px-3 py-2 text-xs font-medium text-ink-3">Recent deliveries</p>
              {deliveries.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 text-xs not-last:border-b not-last:border-line">
                  <span className={`font-mono ${d.status && d.status < 300 ? "text-emerald-700" : "text-red-600"}`}>
                    {d.status ?? "ERR"} {d.error && !d.status ? `· ${d.error}` : ""}
                  </span>
                  <span className="text-ink-3">{new Date(d.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card title="Export" description="Download this form's definition. Import it into any Formloom instance.">
          <button className="btn-outline" onClick={exportJson}>
            <Download className="size-4" /> Download JSON
          </button>
        </Card>
      </div>
    </div>
  );
}

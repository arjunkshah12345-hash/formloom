"use client";

import { useState, useTransition } from "react";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { createApiKey, revokeApiKey } from "@/lib/actions/forms";
import { timeAgo } from "@/lib/format";
import { useCopy } from "@/components/ui";

type Key = { id: string; name: string; preview: string; createdAt: number; lastUsedAt: number | null };

export function ApiKeys({ keys, baseUrl }: { keys: Key[]; baseUrl: string }) {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const copy = useCopy();
  const example = `curl ${baseUrl}/api/v1/forms \\\n  -H "Authorization: Bearer ${token ?? "fl_your_key"}"`;

  return (
    <>
      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <KeyRound className="size-4" /> API keys
        </h2>
        <p className="mt-1 text-sm text-ink-3">Read your forms and responses from scripts, Zapier-style tools or your own backend.</p>
        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const r = await createApiKey(name);
              setToken(r.token);
              setName("");
            });
          }}
        >
          <input className="input" placeholder="Key name, e.g. Analytics script" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary" disabled={pending}>
            Create key
          </button>
        </form>
        {token ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Copy your new key now — you won&apos;t see it again.</p>
            <div className="mt-2 flex gap-2">
              <code className="flex-1 truncate rounded-md bg-white px-3 py-2 font-mono text-xs">{token}</code>
              <button className="btn-outline" onClick={() => copy(token, "Key copied")}>
                <Copy className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
        {keys.length ? (
          <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
            {keys.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{k.name}</p>
                  <p className="text-xs text-ink-3">
                    <span className="font-mono">{k.preview}</span> · created {timeAgo(k.createdAt)} · last used {timeAgo(k.lastUsedAt)}
                  </p>
                </div>
                <button className="btn-ghost text-red-600" onClick={() => start(() => revokeApiKey(k.id))} disabled={pending}>
                  <Trash2 className="size-4" /> Revoke
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="card p-6">
        <h2 className="font-medium">REST API</h2>
        <div className="mt-4 space-y-2 text-sm">
          {[
            ["GET", "/api/v1/forms", "List your forms"],
            ["GET", "/api/v1/forms/:id", "Form definition (draft + published)"],
            ["GET", "/api/v1/forms/:id/responses", "Responses · ?limit=100&offset=0&since=<ms>"],
          ].map(([m, p, d]) => (
            <div key={p} className="flex flex-wrap items-center gap-3">
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">{m}</span>
              <code className="font-mono text-[13px]">{p}</code>
              <span className="text-ink-3">{d}</span>
            </div>
          ))}
        </div>
        <pre className="mt-5 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-xs leading-relaxed text-paper/90">{example}</pre>
      </section>
    </>
  );
}

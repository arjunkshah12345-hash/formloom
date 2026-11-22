"use client";

import { useState } from "react";

/** A code block with a copy button, for docs pages. */
export function CopyCode({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-tech text-[10px] tracking-wide text-ink-3 uppercase">{label ?? "code"}</span>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            })
          }
          className="rounded-full px-3 py-1 font-tech text-[10px] tracking-wide text-ink-2 uppercase transition hover:bg-white/5 hover:text-ink"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-ink-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export type CodeTab = { key: string; label: string; file: string; code: string };

export function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(tabs[0].key);
  const [copied, setCopied] = useState(false);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121110] shadow-2xl">
      <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 pt-2 whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActive(t.key);
              setCopied(false);
            }}
            className={`rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              t.key === active ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => {
            navigator.clipboard.writeText(tab.code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="mb-1.5 ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-5 pt-3 font-mono text-[11px] text-white/35">{tab.file}</div>
      <pre className="scrollbar-thin overflow-x-auto px-5 pt-2 pb-6 font-mono text-[12.5px] leading-relaxed text-white/85">
        <code>{tab.code}</code>
      </pre>
    </div>
  );
}

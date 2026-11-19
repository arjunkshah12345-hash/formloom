"use client";

import { useState } from "react";
import { GitBranch, Paintbrush, SlidersHorizontal } from "lucide-react";
import { Canvas } from "./Canvas";
import { DesignPanel } from "./DesignPanel";
import { LogicPanel } from "./LogicPanel";
import { QuestionPanel } from "./QuestionPanel";
import { Sidebar } from "./Sidebar";
import type { Selection } from "./ops";
import { useWorkspace } from "./workspace";

type Tab = "question" | "logic" | "design";

export function Builder() {
  const { def } = useWorkspace();
  const [selection, setSelection] = useState<Selection>(() =>
    def.fields[0] ? { kind: "field", id: def.fields[0].id } : { kind: "welcome" },
  );
  const [tab, setTab] = useState<Tab>("question");

  // Keep the selection valid if the selected item disappears (undo, delete…).
  const valid =
    selection.kind === "welcome" ||
    (selection.kind === "field" && def.fields.some((f) => f.id === selection.id)) ||
    (selection.kind === "ending" && def.endings.some((e) => e.id === selection.id));
  const current: Selection = valid
    ? selection
    : def.fields[0]
      ? { kind: "field", id: def.fields[0].id }
      : { kind: "welcome" };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "question", label: "Content", icon: <SlidersHorizontal className="size-3.5" /> },
    { key: "logic", label: "Logic", icon: <GitBranch className="size-3.5" /> },
    { key: "design", label: "Design", icon: <Paintbrush className="size-3.5" /> },
  ];

  return (
    <div className="flex h-full">
      <Sidebar selection={current} select={setSelection} />
      <Canvas selection={current} />
      <aside className="flex h-full w-80 shrink-0 flex-col border-l border-line bg-surface">
        <div className="grid grid-cols-3 gap-0.5 border-b border-line p-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition ${
                tab === t.key ? "bg-paper text-ink ring-1 ring-line-2" : "text-ink-3 hover:text-ink"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {tab === "question" ? <QuestionPanel selection={current} /> : null}
          {tab === "logic" ? <LogicPanel selection={current} /> : null}
          {tab === "design" ? <DesignPanel /> : null}
        </div>
      </aside>
    </div>
  );
}

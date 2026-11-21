"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Flag, GitBranch, GripVertical, Hand, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { recallLabels } from "@/lib/engine";
import { createField, uid, type Field, type FormDefinition } from "@/lib/schema";
import { Menu, MenuItem } from "@/components/ui";
import { TypePicker } from "./AddQuestion";
import { TypeIcon } from "./TypeIcon";
import { addEnding, addField, duplicateField, moveField, newEnding, removeEnding, removeField, type Selection } from "./ops";
import { useWorkspace } from "./workspace";

export function Sidebar({ selection, select }: { selection: Selection; select: (s: Selection) => void }) {
  const { def, update } = useWorkspace();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addEl, setAddEl] = useState<HTMLButtonElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = def.fields.findIndex((f) => f.id === e.active.id);
    const to = def.fields.findIndex((f) => f.id === e.over!.id);
    update((d) => moveField(d, from, to));
  };

  const afterId = selection.kind === "field" ? selection.id : def.fields[def.fields.length - 1]?.id;
  let n = 0;
  const numbers = new Map(def.fields.map((f) => [f.id, f.type === "statement" ? null : ++n]));

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="px-1 text-xs font-semibold tracking-wider text-ink-3 uppercase">Content</span>
        <button ref={setAddEl} className="btn-primary h-7 px-2.5 text-xs" onClick={() => setPickerOpen((o) => !o)}>
          <Plus className="size-3.5" /> Add question
        </button>
        <TypePicker
          open={pickerOpen}
          anchor={addEl}
          onClose={() => setPickerOpen(false)}
          onPick={(t) => {
            const f = createField(t);
            update((d) => addField(d, f, afterId));
            select({ kind: "field", id: f.id });
          }}
        />
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-4">
        <Item
          active={selection.kind === "welcome"}
          onClick={() => select({ kind: "welcome" })}
          icon={
            <span className="inline-flex size-7 items-center justify-center rounded-md bg-ink/[0.07] text-ink-2">
              <Hand className="size-4" />
            </span>
          }
          title={def.welcome.enabled ? def.welcome.title || "Welcome screen" : "Welcome screen"}
          muted={!def.welcome.enabled}
          sub={def.welcome.enabled ? "Welcome" : "Off"}
        />

        <div className="mt-2 mb-1 h-px bg-line" />

        <DndContext id="sidebar-fields" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={def.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {def.fields.map((f) => (
              <SortableField
                key={f.id}
                field={f}
                def={def}
                number={numbers.get(f.id) ?? null}
                active={selection.kind === "field" && selection.id === f.id}
                onSelect={() => select({ kind: "field", id: f.id })}
                onDuplicate={() => {
                  const newId = uid("f");
                  update((d) => duplicateField(d, f.id, newId));
                  select({ kind: "field", id: newId });
                }}
                onDelete={() => {
                  const idx = def.fields.findIndex((x) => x.id === f.id);
                  const neighbor = def.fields[idx + 1] ?? def.fields[idx - 1];
                  update((d) => removeField(d, f.id));
                  select(neighbor ? { kind: "field", id: neighbor.id } : { kind: "welcome" });
                }}
              />
            ))}
          </SortableContext>
        </DndContext>

        {!def.fields.length ? (
          <button
            onClick={() => setPickerOpen(true)}
            className="mt-2 w-full rounded-lg border border-dashed border-line-2 px-3 py-6 text-sm text-ink-3 hover:border-ink-3 hover:text-ink"
          >
            Add your first question
          </button>
        ) : null}

        <div className="mt-4 mb-1 flex items-center justify-between px-1">
          <span className="text-xs font-semibold tracking-wider text-ink-3 uppercase">Endings</span>
          <button
            className="btn-ghost h-6 px-1.5 text-xs"
            onClick={() => {
              const e = newEnding();
              update((d) => addEnding(d, e));
              select({ kind: "ending", id: e.id });
            }}
          >
            <Plus className="size-3.5" /> Add
          </button>
        </div>
        {def.endings.map((e, i) => (
          <Item
            key={e.id}
            active={selection.kind === "ending" && selection.id === e.id}
            onClick={() => select({ kind: "ending", id: e.id })}
            icon={
              <span className="inline-flex size-7 items-center justify-center rounded-md bg-emerald-500/12 text-emerald-400">
                <Flag className="size-4" />
              </span>
            }
            title={e.title || "Ending"}
            sub={def.endings.length > 1 ? `Ending ${String.fromCharCode(65 + i)}` : "Ending"}
            menu={
              def.endings.length > 1 ? (
                <Menu
                  trigger={({ onClick }) => (
                    <button
                      className="rounded p-1 text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-ink/[0.07] hover:text-ink"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onClick();
                      }}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  )}
                >
                  {(close) => (
                    <MenuItem
                      danger
                      icon={<Trash2 />}
                      onClick={() => {
                        close();
                        update((d) => removeEnding(d, e.id));
                        select({ kind: "ending", id: def.endings.find((x) => x.id !== e.id)!.id });
                      }}
                    >
                      Delete ending
                    </MenuItem>
                  )}
                </Menu>
              ) : null
            }
          />
        ))}
      </div>
    </aside>
  );
}

function Item({
  active,
  onClick,
  icon,
  title,
  sub,
  muted,
  menu,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
  muted?: boolean;
  menu?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`group mt-0.5 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition ${
        active ? "bg-paper ring-1 ring-line-2" : "hover:bg-paper/70"
      } ${muted ? "opacity-60" : ""}`}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] leading-tight">{title}</span>
        <span className="block text-[11px] text-ink-3">{sub}</span>
      </span>
      {menu}
    </div>
  );
}

function SortableField({
  field,
  def,
  number,
  active,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  field: Field;
  def: FormDefinition;
  number: number | null;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const hasLogic = (field.logic?.length ?? 0) > 0 || Boolean(field.fallbackTo);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={`group relative mt-0.5 flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-1 pl-1 transition ${
        active ? "bg-paper ring-1 ring-line-2" : "hover:bg-paper/70"
      } ${isDragging ? "bg-surface shadow-lg ring-1 ring-line-2" : ""}`}
      onClick={onSelect}
    >
      <button
        className="cursor-grab touch-none rounded p-0.5 text-ink-3 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-3.5" />
      </button>
      <TypeIcon type={field.type} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] leading-tight">
          {number !== null ? <span className="shrink-0 text-ink-3 tabular-nums">{number}</span> : null}
          <span className="truncate">{recallLabels(field.title, def) || "Untitled question"}</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] text-ink-3">
          {field.required && field.type !== "statement" ? "Required" : field.type === "statement" ? "Statement" : "Optional"}
          {hasLogic ? (
            <span className="inline-flex items-center gap-0.5 text-violet-600">
              · <GitBranch className="size-3" /> Logic
            </span>
          ) : null}
        </span>
      </span>
      <Menu
        trigger={({ onClick }) => (
          <button
            className="rounded p-1 text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-ink/[0.07] hover:text-ink"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            aria-label="Question actions"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      >
        {(close) => (
          <div onClick={(e) => e.stopPropagation()}>
            <MenuItem
              icon={<Copy />}
              onClick={() => {
                close();
                onDuplicate();
              }}
            >
              Duplicate
            </MenuItem>
            <MenuItem
              danger
              icon={<Trash2 />}
              onClick={() => {
                close();
                onDelete();
              }}
            >
              Delete
            </MenuItem>
          </div>
        )}
      </Menu>
    </div>
  );
}

import {
  defaultEnding,
  uid,
  type Ending,
  type Field,
  type FormDefinition,
} from "@/lib/schema";

export type Selection = { kind: "welcome" } | { kind: "field"; id: string } | { kind: "ending"; id: string };

export function updateField(def: FormDefinition, id: string, fn: (f: Field) => Field): FormDefinition {
  return { ...def, fields: def.fields.map((f) => (f.id === id ? fn(f) : f)) };
}

export function updateEnding(def: FormDefinition, id: string, fn: (e: Ending) => Ending): FormDefinition {
  return { ...def, endings: def.endings.map((e) => (e.id === id ? fn(e) : e)) };
}

export function addField(def: FormDefinition, field: Field, afterId?: string): FormDefinition {
  const idx = afterId ? def.fields.findIndex((f) => f.id === afterId) : -1;
  const fields = [...def.fields];
  fields.splice(idx >= 0 ? idx + 1 : fields.length, 0, field);
  return { ...def, fields };
}

export function duplicateField(def: FormDefinition, id: string, newId: string): FormDefinition {
  const idx = def.fields.findIndex((f) => f.id === id);
  if (idx < 0) return def;
  const src = def.fields[idx];
  const copy: Field = {
    ...structuredClone(src),
    id: newId,
    logic: [],
    fallbackTo: undefined,
  };
  if (copy.properties.choices) copy.properties.choices = copy.properties.choices.map((c) => ({ ...c, id: uid("c") }));
  const fields = [...def.fields];
  fields.splice(idx + 1, 0, copy);
  return { ...def, fields };
}

/** Remove references to a deleted field/ending from all logic. */
function scrubTarget(def: FormDefinition, target: string): FormDefinition {
  return {
    ...def,
    fields: def.fields.map((f) => ({
      ...f,
      fallbackTo: f.fallbackTo === target ? undefined : f.fallbackTo,
      logic: (f.logic ?? [])
        .filter((r) => r.to !== target)
        .map((r) => ({ ...r, conditions: r.conditions.filter((c) => c.fieldId !== target) }))
        .filter((r) => r.conditions.length > 0),
    })),
  };
}

export function removeField(def: FormDefinition, id: string): FormDefinition {
  return scrubTarget({ ...def, fields: def.fields.filter((f) => f.id !== id) }, id);
}

export function moveField(def: FormDefinition, from: number, to: number): FormDefinition {
  const fields = [...def.fields];
  const [item] = fields.splice(from, 1);
  fields.splice(to, 0, item);
  return { ...def, fields };
}

export function newEnding(): Ending {
  return { ...defaultEnding(), title: "Thanks for your time!" };
}

export function addEnding(def: FormDefinition, ending: Ending): FormDefinition {
  return { ...def, endings: [...def.endings, ending] };
}

export function removeEnding(def: FormDefinition, id: string): FormDefinition {
  if (def.endings.length <= 1) return def;
  return scrubTarget({ ...def, endings: def.endings.filter((e) => e.id !== id) }, id);
}

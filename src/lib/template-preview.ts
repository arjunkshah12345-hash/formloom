import type { FormDefinition } from "./schema";
import { TEMPLATES } from "./templates";

/** A template's definition for public previews, with hidden-field placeholders filled in. */
export function templatePreview(key: string): FormDefinition | null {
  const t = TEMPLATES.find((x) => x.key === key);
  if (!t) return null;
  return JSON.parse(JSON.stringify(t.build()).replace(/\{\{hidden:product\}\}/g, "our product"));
}

"use server";

import { requireUser } from "@/lib/auth";
import { createForm, getForm } from "@/lib/forms";
import { TEMPLATES } from "@/lib/templates";

/** First form for a new account, picked during onboarding. */
export async function startWithTemplate(templateKey: string) {
  const user = await requireUser();
  const template = TEMPLATES.find((t) => t.key === templateKey) ?? TEMPLATES[0];
  const id = await createForm(user.id, template.build());
  const form = await getForm(id, user.id);
  return { id, slug: form?.slug ?? "", title: form?.title ?? template.name };
}

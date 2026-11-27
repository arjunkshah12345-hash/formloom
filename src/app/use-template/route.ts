import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createForm } from "@/lib/forms";
import { TEMPLATES } from "@/lib/templates";

/** "Use this template": copies a template into the visitor's account, signing them up first if needed. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const template = TEMPLATES.find((t) => t.key === key);
  if (!template) return NextResponse.redirect(new URL("/templates", url));
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL(`/signup?template=${encodeURIComponent(key)}`, url));
  const id = await createForm(user.id, template.build());
  return NextResponse.redirect(new URL(`/forms/${id}/edit`, url));
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Player from "@/components/player/Player";
import { getPlan, isLimited } from "@/lib/billing";
import { closedReason } from "@/lib/closed";
import { getFormBySlug } from "@/lib/forms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/f/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  const def = form?.published;
  if (!def) return { title: "Form not found" };
  return {
    title: { absolute: def.title },
    description: def.welcome.enabled ? def.welcome.description : undefined,
    openGraph: { title: def.title, description: def.welcome.description },
  };
}

export default async function PublicForm({ params, searchParams }: PageProps<"/f/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const form = await getFormBySlug(slug);
  if (!form?.published) notFound();
  // Removing the badge is a Pro feature on Formloom Cloud.
  const definition = isLimited(await getPlan(form.userId))
    ? { ...form.published, settings: { ...form.published.settings, showBranding: true } }
    : form.published;
  return (
    <Player
      definition={definition}
      slug={slug}
      mode={sp.embed ? "embed" : "live"}
      closedMessage={await closedReason(form)}
    />
  );
}

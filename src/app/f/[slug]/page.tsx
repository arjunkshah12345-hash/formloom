import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Player from "@/components/player/Player";
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
  return (
    <Player
      definition={form.published}
      slug={slug}
      mode={sp.embed ? "embed" : "live"}
      closedMessage={await closedReason(form)}
    />
  );
}

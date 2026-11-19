import { notFound } from "next/navigation";
import Player from "@/components/player/Player";
import { requireUser } from "@/lib/auth";
import { getForm } from "@/lib/forms";

export const metadata = { title: "Preview" };

export default async function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const form = getForm(id, user.id);
  if (!form) notFound();
  return <Player definition={form.draft} mode="preview" />;
}

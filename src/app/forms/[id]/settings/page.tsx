import { SettingsView } from "@/components/builder/SettingsView";
import { requireUser } from "@/lib/auth";
import { getForm, recentWebhooks } from "@/lib/forms";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ params }: PageProps<"/forms/[id]/settings">) {
  const { id } = await params;
  const user = await requireUser();
  const form = getForm(id, user.id);
  return <SettingsView deliveries={form ? recentWebhooks(form.id) : []} />;
}

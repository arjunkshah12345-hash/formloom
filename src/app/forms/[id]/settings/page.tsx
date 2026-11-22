import { SettingsView } from "@/components/builder/SettingsView";
import { requireUser } from "@/lib/auth";
import { getPlan, isLimited } from "@/lib/billing";
import { getForm, recentWebhooks } from "@/lib/forms";

export const metadata = { title: "Settings" };

export default async function SettingsPage({ params }: PageProps<"/forms/[id]/settings">) {
  const { id } = await params;
  const user = await requireUser();
  const form = await getForm(id, user.id);
  return (
    <SettingsView
      deliveries={form ? await recentWebhooks(form.id) : []}
      brandingLocked={isLimited(await getPlan(user.id))}
    />
  );
}

import { Onboarding } from "@/components/onboarding/Onboarding";
import { requireUser } from "@/lib/auth";
import { TEMPLATES } from "@/lib/templates";
import { appUrl } from "@/lib/url";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const user = await requireUser();
  const templates = TEMPLATES.map(({ key, name, description, build }) => {
    const def = build();
    return {
      key,
      name,
      description,
      theme: def.theme,
      sample: def.welcome.enabled ? def.welcome.title : (def.fields[0]?.title ?? ""),
    };
  });
  return <Onboarding firstName={user.name.split(" ")[0]} base={await appUrl()} templates={templates} />;
}

import { Onboarding } from "@/components/onboarding/Onboarding";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/billing";
import { launchActive, launchEndsLabel, PRO_PRICE } from "@/lib/plans";
import { TEMPLATES } from "@/lib/templates";
import { appUrl } from "@/lib/url";

export const metadata = { title: "Welcome" };

export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const user = await requireUser();
  const { upgraded } = await searchParams;
  const plan = await getPlan(user.id);
  const offer = plan.kind === "free" && launchActive() ? { endsLabel: launchEndsLabel(), year: PRO_PRICE.year } : null;
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
  return (
    <Onboarding
      firstName={user.name.split(" ")[0]}
      base={await appUrl()}
      templates={templates}
      offer={offer}
      justUpgraded={upgraded === "1" || plan.kind === "pro"}
    />
  );
}

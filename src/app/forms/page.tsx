import { AppHeader } from "@/components/app/AppHeader";
import { FormsGrid } from "@/components/app/FormsGrid";
import { HeldNotice } from "@/components/app/PlanNotice";
import { LaunchOffer } from "@/components/app/LaunchOffer";
import { getPlan, heldResponses } from "@/lib/billing";
import { launchActive, launchEndsLabel, LIFETIME_PRICE, PRO_PRICE } from "@/lib/plans";
import { requireUser } from "@/lib/auth";
import { listForms } from "@/lib/forms";
import { TEMPLATES } from "@/lib/templates";

export const metadata = { title: "Forms" };

export default async function FormsPage() {
  const user = await requireUser();
  const forms = await listForms(user.id);
  const templates = TEMPLATES.map(({ key, name, description, build }) => {
    const def = build();
    return { key, name, description, theme: def.theme, sample: def.welcome.enabled ? def.welcome.title : def.fields[0]?.title ?? "" };
  });
  const total = forms.reduce((n, f) => n + f.responseCount, 0);
  const offer = launchActive() && (await getPlan(user.id)).kind === "free";
  return (
    <div className="min-h-dvh">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 empty:hidden">
          <HeldNotice held={await heldResponses(user.id)} />
        </div>
        <FormsGrid
          forms={forms}
          templates={templates}
          greeting={`Hi ${user.name.split(" ")[0]}`}
          totalResponses={total}
        />
      </main>
      {offer ? <LaunchOffer endsLabel={launchEndsLabel()} year={PRO_PRICE.year} month={PRO_PRICE.month} lifetime={LIFETIME_PRICE} /> : null}
    </div>
  );
}

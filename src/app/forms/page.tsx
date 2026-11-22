import { AppHeader } from "@/components/app/AppHeader";
import { FormsGrid } from "@/components/app/FormsGrid";
import { HeldNotice } from "@/components/app/PlanNotice";
import { heldResponses } from "@/lib/billing";
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
    </div>
  );
}

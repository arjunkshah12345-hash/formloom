import { notFound } from "next/navigation";
import { ResultsView } from "@/components/results/ResultsView";
import { requireUser } from "@/lib/auth";
import { HeldNotice } from "@/components/app/PlanNotice";
import { formStats, getForm, listResponses, lockedCount } from "@/lib/forms";
import { rangeSince } from "@/lib/range";
import { summarize } from "@/lib/summary";

export const metadata = { title: "Results" };

export default async function ResultsPage({ params, searchParams }: PageProps<"/forms/[id]/results">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  const form = await getForm(id, user.id);
  if (!form) notFound();
  const { key, since } = rangeSince(typeof sp.range === "string" ? sp.range : undefined);
  const responses = await listResponses(form.id, { since });
  const stats = await formStats(form.id, since);
  const def = form.draft;
  return (
    <ResultsView
      formId={form.id}
      def={def}
      range={key}
      view={sp.view === "responses" ? "responses" : "summary"}
      stats={stats}
      summary={summarize(def, responses)}
      responses={responses}
      isPublished={Boolean(form.published)}
      notice={<HeldNotice held={await lockedCount(form.id)} scope="form" />}
    />
  );
}

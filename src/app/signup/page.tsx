import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { signupsAllowed } from "@/lib/actions/auth";
import { googleEnabled } from "@/lib/google";
import { launchActive } from "@/lib/plans";
import { TEMPLATES } from "@/lib/templates";

export const metadata = { title: "Sign up free", description: "Create a free Formloom account: Typeform-style forms with 1,000 free responses a month, logic, themes and webhooks. No credit card.", alternates: { canonical: "/signup" } };

const PLAN_NOTE: Record<string, string> = {
  year: "Pro, billed yearly",
  month: "Pro, billed monthly",
  lifetime: "Pro Lifetime, paid once",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { plan, template } = await searchParams;
  const picked = typeof plan === "string" && plan in PLAN_NOTE ? plan : null;
  const tpl = !picked && typeof template === "string" ? TEMPLATES.find((t) => t.key === template) : undefined;
  const next = picked ? `/upgrade?plan=${picked}` : tpl ? `/use-template?key=${tpl.key}` : undefined;
  if (await getCurrentUser()) redirect(next ?? "/forms");
  if (!(await signupsAllowed())) redirect("/login");
  const note = tpl
    ? `Create a free account and your ${tpl.name.toLowerCase()} template opens in the editor. No credit card.`
    : picked
    ? `Step 1 of 2: create your account. Next you'll check out for ${PLAN_NOTE[picked]}${
        picked !== "lifetime" && launchActive() ? ", half off your first payment" : ""
      }.`
    : undefined;
  return (
    <AuthForm mode="signup" signupsOpen google={googleEnabled()} next={next} note={note} />
  );
}

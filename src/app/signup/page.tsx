import { redirect } from "next/navigation";
import { AuthForm } from "@/components/app/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { signupsAllowed } from "@/lib/actions/auth";
import { googleEnabled } from "@/lib/google";
import { launchActive } from "@/lib/plans";

export const metadata = { title: "Sign up free", description: "Create a free Formloom account: Typeform-style forms with 1,000 free responses a month, logic, themes and webhooks. No credit card.", alternates: { canonical: "/signup" } };

const PLAN_NOTE: Record<string, string> = {
  year: "Pro, billed yearly",
  month: "Pro, billed monthly",
  lifetime: "Pro Lifetime, paid once",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { plan } = await searchParams;
  const picked = typeof plan === "string" && plan in PLAN_NOTE ? plan : null;
  if (await getCurrentUser()) redirect(picked ? `/upgrade?plan=${picked}` : "/forms");
  if (!(await signupsAllowed())) redirect("/login");
  const note = picked
    ? `Step 1 of 2: create your account. Next you'll check out for ${PLAN_NOTE[picked]}${
        picked !== "lifetime" && launchActive() ? ", half off your first payment" : ""
      }.`
    : undefined;
  return (
    <AuthForm mode="signup" signupsOpen google={googleEnabled()} next={picked ? `/upgrade?plan=${picked}` : undefined} note={note} />
  );
}

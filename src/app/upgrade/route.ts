import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { billingEnabled, createCheckout, getPlan } from "@/lib/billing";
import { listForms } from "@/lib/forms";
import type { Purchase } from "@/lib/plans";
import { appUrl } from "@/lib/url";

/**
 * One link for every "buy" button: /upgrade?plan=year|month|lifetime.
 * Signed out → sign up first (the plan rides along), then straight to Stripe Checkout.
 */
export async function GET(req: Request) {
  const base = await appUrl();
  const asked = new URL(req.url).searchParams.get("plan");
  const plan: Purchase = asked === "month" || asked === "lifetime" ? asked : "year";
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${base}/signup?plan=${plan}`);
  if (!billingEnabled()) return NextResponse.redirect(`${base}/account`);
  const current = await getPlan(user.id);
  if (current.kind === "pro") return NextResponse.redirect(`${base}/account#plan`);
  // A brand-new account has no forms yet: send it through onboarding after Checkout.
  const isNew = (await listForms(user.id)).length === 0;
  try {
    const url = await createCheckout(
      user,
      plan,
      base,
      isNew ? { success: "/welcome?upgraded=1", cancel: "/welcome" } : {},
    );
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error("upgrade checkout", e);
    return NextResponse.redirect(`${base}/account?billing=unavailable#plan`);
  }
}

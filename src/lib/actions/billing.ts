"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { billingEnabled, createCheckout, createPortal } from "@/lib/billing";
import { appUrl } from "@/lib/url";

export async function startCheckout(formData: FormData) {
  const user = await requireUser();
  if (!billingEnabled()) redirect("/account");
  const asked = formData.get("interval");
  const purchase = asked === "month" || asked === "lifetime" ? asked : "year";
  try {
    redirect(await createCheckout(user, purchase, await appUrl()));
  } catch (e) {
    unstable_rethrow(e);
    console.error("startCheckout", e);
    redirect("/account?billing=unavailable#plan");
  }
}

export async function openBillingPortal() {
  const user = await requireUser();
  if (!billingEnabled()) redirect("/account");
  try {
    redirect((await createPortal(user.id, await appUrl())) ?? "/account");
  } catch (e) {
    unstable_rethrow(e);
    console.error("openBillingPortal", e);
    redirect("/account?billing=unavailable#plan");
  }
}

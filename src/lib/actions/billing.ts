"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { billingEnabled, createCheckout, createPortal } from "@/lib/billing";
import { appUrl } from "@/lib/url";

export async function startCheckout(formData: FormData) {
  const user = await requireUser();
  if (!billingEnabled()) redirect("/account");
  const asked = formData.get("interval");
  const purchase = asked === "month" || asked === "lifetime" ? asked : "year";
  redirect(await createCheckout(user, purchase, await appUrl()));
}

export async function openBillingPortal() {
  const user = await requireUser();
  if (!billingEnabled()) redirect("/account");
  redirect((await createPortal(user.id, await appUrl())) ?? "/account");
}

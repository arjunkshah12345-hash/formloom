import { AppHeader } from "@/components/app/AppHeader";
import { ApiKeys } from "@/components/app/ApiKeys";
import { PlanCard } from "@/components/app/PlanCard";
import { requireUser } from "@/lib/auth";
import { getPlan, heldResponses, monthlyUsage, syncFromStripe } from "@/lib/billing";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/url";

export const metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser();
  const justUpgraded = (await searchParams).upgraded === "1";
  let plan = await getPlan(user.id);
  // Back from Checkout before Stripe's webhook landed: ask Stripe directly.
  if (justUpgraded && (plan.kind === "free" || (plan.kind === "pro" && plan.interval !== "lifetime"))) {
    await syncFromStripe(user.id).catch(() => {});
    plan = await getPlan(user.id);
  }
  const [usage, held] = await Promise.all([monthlyUsage(user.id), heldResponses(user.id)]);
  const keys = await (await db()).all<{
    id: string;
    name: string;
    preview: string;
    createdAt: number;
    lastUsedAt: number | null;
  }>(
    "SELECT id, name, preview, created_at AS createdAt, last_used_at AS lastUsedAt FROM api_keys WHERE user_id = ? ORDER BY created_at DESC",
    user.id,
  );
  return (
    <div className="min-h-dvh">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
        <div>
          <h1 className="font-heading text-5xl font-medium tracking-[-0.04em]">Account</h1>
          <p className="mt-2 text-sm text-ink-2">
            Signed in as <b className="font-medium text-ink">{user.name}</b> · {user.email}
          </p>
        </div>
        <PlanCard plan={plan} usage={usage} held={held} justUpgraded={justUpgraded} />
        <ApiKeys keys={keys} baseUrl={await appUrl()} />
      </main>
    </div>
  );
}

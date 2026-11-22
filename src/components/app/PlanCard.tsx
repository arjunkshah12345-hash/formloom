import { Check, Server } from "lucide-react";
import { openBillingPortal, startCheckout } from "@/lib/actions/billing";
import type { Plan } from "@/lib/billing";
import { dollars, FREE_MONTHLY_RESPONSES, LAUNCH_CODE, LIFETIME_PRICE, PLAN_FEATURES, PRO_PRICE } from "@/lib/plans";

const fmt = (n: number) => n.toLocaleString("en-US");
const date = (ms: number) => new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export function PlanCard({
  plan,
  usage,
  held,
  justUpgraded,
}: {
  plan: Plan;
  usage: { used: number };
  held: number;
  justUpgraded: boolean;
}) {
  if (plan.kind === "self-hosted") {
    return (
      <section id="plan" className="card scroll-mt-24 p-6">
        <h2 className="flex items-center gap-2 font-medium">
          <Server className="size-4" /> Self-hosted
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          Every feature is on and nothing is metered: unlimited responses, no badge unless you want one. It&apos;s
          yours.
        </p>
      </section>
    );
  }

  if (plan.kind === "pro" && plan.interval === "lifetime") {
    return (
      <section id="plan" className="card scroll-mt-24 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-medium">
              Formloom Pro
              <span className="rounded-full bg-accent/15 px-2 py-0.5 font-tech text-[10px] tracking-wide text-accent uppercase">
                Lifetime
              </span>
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              {justUpgraded ? "Thanks for backing Formloom. " : ""}
              Paid once: unlimited responses and no badge, for good. Nothing renews.
            </p>
            <p className="mt-3 text-sm text-ink-2">{fmt(usage.used)} responses this month</p>
          </div>
          <form action={openBillingPortal}>
            <button className="btn-outline">Receipts</button>
          </form>
        </div>
      </section>
    );
  }

  if (plan.kind === "pro") {
    const ending = plan.cancelAtPeriodEnd;
    return (
      <section id="plan" className="card scroll-mt-24 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-medium">
              Formloom Pro
              <span className="rounded-full bg-accent/15 px-2 py-0.5 font-tech text-[10px] tracking-wide text-accent uppercase">
                {plan.status === "past_due" ? "Payment due" : "Active"}
              </span>
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              {justUpgraded ? "Thanks for supporting Formloom. " : ""}
              Unlimited responses, no badge.{" "}
              {plan.periodEnd
                ? ending
                  ? `Ends ${date(plan.periodEnd)}, then you're back on Free and keep everything.`
                  : `Renews ${date(plan.periodEnd)}${plan.interval ? `, billed ${plan.interval === "year" ? "yearly" : "monthly"}` : ""}.`
                : null}
            </p>
            <p className="mt-3 text-sm text-ink-2">{fmt(usage.used)} responses this month</p>
          </div>
          <div className="flex flex-col gap-2">
            <form action={openBillingPortal}>
              <button className="btn-outline w-full">Manage billing</button>
            </form>
            <form action={startCheckout}>
              <input type="hidden" name="interval" value="lifetime" />
              <button className="btn-ghost w-full text-sm">Switch to Lifetime, {dollars(LIFETIME_PRICE)} once</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  const pct = Math.min(100, (usage.used / FREE_MONTHLY_RESPONSES) * 100);
  return (
    <section id="plan" className="card scroll-mt-24 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-medium">Free plan</h2>
        <p className="font-tech text-[11px] text-ink-3">
          {fmt(usage.used)} / {fmt(FREE_MONTHLY_RESPONSES)} responses this month
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-2">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-accent" : "bg-ink"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink-3">
        {held > 0
          ? held === 1
            ? "1 held response is saved and waiting. It appears the moment you upgrade."
            : `${fmt(held)} held responses are saved and waiting. They appear the moment you upgrade.`
          : "Resets on the 1st. Past the limit, responses are still saved and held for you, never turned away."}
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl border border-line-2 bg-white/[0.02] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-heading text-2xl font-medium tracking-tight">
            Pro · {dollars(PRO_PRICE.year / 12)}
            <span className="text-base text-ink-3">/month, billed yearly</span>
          </p>
          <p className="text-sm text-ink-3">or {dollars(PRO_PRICE.month)} month to month. One flat price, no seats.</p>
          <ul className="mt-4 grid gap-1.5 text-sm text-ink-2 sm:grid-cols-2">
            {PLAN_FEATURES.pro.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-3.5 text-accent" strokeWidth={2.5} /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <form action={startCheckout}>
            <input type="hidden" name="interval" value="year" />
            <button className="btn-accent w-full">Upgrade, {dollars(PRO_PRICE.year)}/year</button>
          </form>
          <form action={startCheckout}>
            <input type="hidden" name="interval" value="month" />
            <button className="btn-outline w-full">{dollars(PRO_PRICE.month)}/month</button>
          </form>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-3">
        Launch offer: code <span className="font-tech text-ink-2">{LAUNCH_CODE}</span> takes half off your first Pro
        payment.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line-2 p-5">
        <div>
          <p className="font-medium">
            Lifetime · {dollars(LIFETIME_PRICE)} <span className="text-sm font-normal text-ink-3">once</span>
          </p>
          <p className="text-sm text-ink-3">Hate subscriptions? Pay once and keep Pro for good. Nothing renews.</p>
        </div>
        <form action={startCheckout}>
          <input type="hidden" name="interval" value="lifetime" />
          <button className="btn-outline">Buy Lifetime</button>
        </form>
      </div>
    </section>
  );
}

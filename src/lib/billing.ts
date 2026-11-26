import "server-only";
import { db } from "./db";
import {
  FREE_MONTHLY_RESPONSES,
  LAUNCH_CODE,
  launchActive,
  LIFETIME_PRICE,
  PRICE_LOOKUP_KEYS,
  PRO_PRICE,
  type Purchase,
} from "./plans";

/**
 * Formloom Cloud billing, through Stripe's REST API (plain fetch, so it runs on Workers).
 *
 * Billing is on only when STRIPE_SECRET_KEY is set. Without it (every self-hosted
 * install) there are no plans: no response allowance and no forced badge.
 */
export const billingEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

export type Plan =
  | { kind: "self-hosted" }
  | { kind: "free" }
  | {
      kind: "pro";
      status: string;
      /** "lifetime" was paid once and never renews. */
      interval: Purchase | null;
      periodEnd: number | null;
      cancelAtPeriodEnd: boolean;
    };

type PlanRow = {
  plan: string;
  plan_status: string | null;
  plan_interval: string | null;
  plan_period_end: number | null;
  plan_cancel_at_period_end: number;
  stripe_customer_id: string | null;
};

export async function getPlan(userId: string): Promise<Plan> {
  if (!billingEnabled()) return { kind: "self-hosted" };
  const row = await (await db()).get<PlanRow>(
    `SELECT plan, plan_status, plan_interval, plan_period_end, plan_cancel_at_period_end, stripe_customer_id
     FROM users WHERE id = ?`,
    userId,
  );
  if (row?.plan !== "pro") return { kind: "free" };
  return {
    kind: "pro",
    status: row.plan_status ?? "active",
    interval:
      row.plan_interval === "year" || row.plan_interval === "month" || row.plan_interval === "lifetime"
        ? row.plan_interval
        : null,
    periodEnd: row.plan_period_end,
    cancelAtPeriodEnd: Boolean(row.plan_cancel_at_period_end),
  };
}

/** Whether a plan is held to the free allowance and the badge. */
export const isLimited = (plan: Plan) => plan.kind === "free";

export const monthStart = (now = new Date()) => Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

/** Responses received this calendar month (UTC) across all of a user's forms, held ones included. */
export async function monthlyUsage(userId: string): Promise<{ used: number; locked: number }> {
  const row = await (await db()).get<{ used: number; locked: number | null }>(
    `SELECT COUNT(*) AS used, SUM(r.locked) AS locked FROM responses r
     JOIN forms f ON f.id = r.form_id WHERE f.user_id = ? AND r.submitted_at >= ?`,
    userId,
    monthStart(),
  );
  return { used: row?.used ?? 0, locked: row?.locked ?? 0 };
}

/** All responses being held for a user, from any month. */
export async function heldResponses(userId: string): Promise<number> {
  const row = await (await db()).get<{ n: number }>(
    `SELECT COUNT(*) AS n FROM responses r JOIN forms f ON f.id = r.form_id
     WHERE f.user_id = ? AND r.locked = 1`,
    userId,
  );
  return row?.n ?? 0;
}

/**
 * Whether the next response to this user's forms goes past the free allowance.
 * Respondents are never turned away: the response is saved either way.
 */
export async function shouldHoldNextResponse(userId: string): Promise<boolean> {
  const plan = await getPlan(userId);
  if (!isLimited(plan)) return false;
  return (await monthlyUsage(userId)).used >= FREE_MONTHLY_RESPONSES;
}

export async function releaseHeldResponses(userId: string) {
  await (await db()).run(
    `UPDATE responses SET locked = 0 WHERE locked = 1 AND form_id IN (SELECT id FROM forms WHERE user_id = ?)`,
    userId,
  );
}

// ---------------------------------------------------------------------------
// Stripe

type StripeParams = Record<string, string | number | boolean | undefined>;

async function stripe<T = unknown>(method: "GET" | "POST", path: string, params: StripeParams = {}): Promise<T> {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) body.append(k, String(v));
  const qs = method === "GET" && [...body].length ? `?${body}` : "";
  // STRIPE_API_BASE points at stripe-mock or a local stub in tests.
  const base = process.env.STRIPE_API_BASE ?? "https://api.stripe.com";
  const res = await fetch(`${base}/v1/${path}${qs}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" ? body : undefined,
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(`Stripe: ${json.error?.message ?? res.status}`);
  return json;
}

async function customerFor(user: { id: string; email: string; name: string }): Promise<string> {
  const d = await db();
  const row = await d.get<{ stripe_customer_id: string | null }>(
    "SELECT stripe_customer_id FROM users WHERE id = ?",
    user.id,
  );
  if (row?.stripe_customer_id) return row.stripe_customer_id;
  const customer = await stripe<{ id: string }>("POST", "customers", {
    email: user.email,
    name: user.name,
    "metadata[formloom_user_id]": user.id,
  });
  await d.run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", customer.id, user.id);
  return customer.id;
}

/**
 * The Stripe price for a purchase, by lookup key (scripts/stripe-setup.sh creates them).
 * Null when the account hasn't been set up, in which case Checkout defines the price inline.
 */
const priceCache = new Map<Purchase, string | null>();
async function priceId(purchase: Purchase): Promise<string | null> {
  if (!priceCache.has(purchase)) {
    const list = await stripe<{ data: { id: string }[] }>("GET", "prices", {
      "lookup_keys[]": PRICE_LOOKUP_KEYS[purchase],
      active: true,
      limit: 1,
    });
    priceCache.set(purchase, list.data[0]?.id ?? null);
  }
  return priceCache.get(purchase) ?? null;
}

/** The active LAUNCH_CODE promotion code, if the Stripe account has one. */
let launchPromo: string | null | undefined;
async function launchPromotionCode(): Promise<string | null> {
  if (launchPromo === undefined) {
    const list = await stripe<{ data: { id: string }[] }>("GET", "promotion_codes", { code: LAUNCH_CODE, active: true, limit: 1 });
    launchPromo = list.data[0]?.id ?? null;
  }
  return launchPromo;
}

/** A Stripe Checkout page: Pro monthly or yearly, or Lifetime paid once. */
export async function createCheckout(
  user: { id: string; email: string; name: string },
  purchase: Purchase,
  baseUrl: string,
  /** Where Stripe sends the buyer back to. New accounts go to onboarding instead of /account. */
  paths: { success?: string; cancel?: string } = {},
): Promise<string> {
  const lifetime = purchase === "lifetime";
  const price = await priceId(purchase);
  const line: StripeParams = price
    ? { "line_items[0][price]": price }
    : {
        "line_items[0][price_data][currency]": "usd",
        "line_items[0][price_data][unit_amount]": lifetime ? LIFETIME_PRICE : PRO_PRICE[purchase],
        "line_items[0][price_data][product_data][name]": lifetime ? "Formloom Pro Lifetime" : "Formloom Pro",
        ...(lifetime ? {} : { "line_items[0][price_data][recurring][interval]": purchase }),
      };
  const params: StripeParams = {
    mode: lifetime ? "payment" : "subscription",
    customer: await customerFor(user),
    client_reference_id: user.id,
    "line_items[0][quantity]": 1,
    ...line,
    "metadata[formloom_user_id]": user.id,
    "metadata[formloom_plan]": purchase,
    ...(lifetime
      ? {
          "payment_intent_data[metadata][formloom_user_id]": user.id,
          "payment_intent_data[metadata][formloom_plan]": "lifetime",
          "invoice_creation[enabled]": true,
        }
      : { "subscription_data[metadata][formloom_user_id]": user.id }),
    allow_promotion_codes: true,
    // The Stripe account may belong to another business; show "Formloom" on the Checkout page either way.
    "branding_settings[display_name]": "Formloom",
    billing_address_collection: "auto",
    "customer_update[address]": "auto",
    "customer_update[name]": "auto",
    "tax_id_collection[enabled]": true,
    success_url: `${baseUrl}${paths.success ?? "/account?upgraded=1"}`,
    cancel_url: `${baseUrl}${paths.cancel ?? "/account"}`,
  };
  // During launch, Pro gets LAUNCH_CODE without typing it. Stripe refuses a discount the customer can't use
  // (say, they've paid before), so fall back to the plain page with the promo-code box.
  const promo = !lifetime && price && launchActive() ? await launchPromotionCode().catch(() => null) : null;
  if (promo) {
    const { allow_promotion_codes: _, ...rest } = params;
    try {
      return (await stripe<{ url: string }>("POST", "checkout/sessions", { ...rest, "discounts[0][promotion_code]": promo })).url;
    } catch {}
  }
  return (await stripe<{ url: string }>("POST", "checkout/sessions", params)).url;
}

/** Formloom's own portal configuration (scripts/stripe-setup.sh), or the account default if there isn't one. */
let portalConfig: string | null | undefined;
async function portalConfiguration(): Promise<string | undefined> {
  if (portalConfig === undefined) {
    const list = await stripe<{ data: { id: string; metadata?: Record<string, string> }[] }>(
      "GET",
      "billing_portal/configurations",
      { active: true, limit: 100 },
    );
    portalConfig = list.data.find((c) => c.metadata?.formloom === "portal")?.id ?? null;
  }
  return portalConfig ?? undefined;
}

export async function createPortal(userId: string, baseUrl: string): Promise<string | null> {
  const row = await (await db()).get<{ stripe_customer_id: string | null }>(
    "SELECT stripe_customer_id FROM users WHERE id = ?",
    userId,
  );
  if (!row?.stripe_customer_id) return null;
  const session = await stripe<{ url: string }>("POST", "billing_portal/sessions", {
    customer: row.stripe_customer_id,
    configuration: await portalConfiguration(),
    return_url: `${baseUrl}/account`,
  });
  return session.url;
}

type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data: { current_period_end?: number; price?: { recurring?: { interval?: string } } }[] };
};

/** Pro while the subscription is in good standing (or briefly past due while Stripe retries). */
const PAYING = new Set(["active", "trialing", "past_due"]);

export async function syncSubscription(sub: StripeSubscription) {
  const d = await db();
  const owner =
    (sub.metadata?.formloom_user_id &&
      (await d.get<{ id: string }>("SELECT id FROM users WHERE id = ?", sub.metadata.formloom_user_id))) ||
    (await d.get<{ id: string }>("SELECT id FROM users WHERE stripe_customer_id = ?", sub.customer));
  if (!owner) return;
  if (await hasLifetime(owner.id)) {
    // Lifetime outranks any subscription; just remember the ids.
    await d.run("UPDATE users SET stripe_customer_id = ? WHERE id = ?", sub.customer, owner.id);
    return;
  }
  const item = sub.items?.data[0];
  const periodEnd = item?.current_period_end ?? sub.current_period_end ?? null;
  const pro = PAYING.has(sub.status);
  await d.run(
    `UPDATE users SET plan = ?, plan_status = ?, plan_interval = ?, plan_period_end = ?, plan_cancel_at_period_end = ?,
       stripe_customer_id = ?, stripe_subscription_id = ? WHERE id = ?`,
    pro ? "pro" : "free",
    sub.status,
    item?.price?.recurring?.interval ?? null,
    periodEnd ? periodEnd * 1000 : null,
    sub.cancel_at_period_end ? 1 : 0,
    sub.customer,
    sub.id,
    owner.id,
  );
  if (pro) await releaseHeldResponses(owner.id);
}

async function hasLifetime(userId: string) {
  const row = await (await db()).get<{ plan: string; plan_interval: string | null }>(
    "SELECT plan, plan_interval FROM users WHERE id = ?",
    userId,
  );
  return row?.plan === "pro" && row.plan_interval === "lifetime";
}

export type StripeCheckoutSession = {
  id: string;
  mode: string;
  payment_status: string;
  customer: string | null;
  subscription: string | null;
  payment_intent: string | null;
  metadata?: Record<string, string>;
};

/** Grants Lifetime for a paid one-time Checkout, and stops any subscription from renewing. */
export async function grantLifetime(session: StripeCheckoutSession) {
  if (session.mode !== "payment" || session.payment_status !== "paid") return;
  if (session.metadata?.formloom_plan !== "lifetime") return;
  const d = await db();
  const owner = await d.get<{ id: string; stripe_subscription_id: string | null }>(
    "SELECT id, stripe_subscription_id FROM users WHERE id = ?",
    session.metadata.formloom_user_id ?? "",
  );
  if (!owner) return;
  if (session.payment_intent) {
    const pi = await stripe<{ latest_charge?: { refunded?: boolean } | null }>(
      "GET",
      `payment_intents/${session.payment_intent}`,
      { "expand[]": "latest_charge" },
    );
    if (pi.latest_charge?.refunded) return;
  }
  if (owner.stripe_subscription_id) {
    const sub = await fetchSubscription(owner.stripe_subscription_id).catch(() => null);
    if (sub && PAYING.has(sub.status) && !sub.cancel_at_period_end) {
      await stripe("POST", `subscriptions/${sub.id}`, { cancel_at_period_end: true });
    }
  }
  await d.run(
    `UPDATE users SET plan = 'pro', plan_status = 'active', plan_interval = 'lifetime', plan_period_end = NULL,
       plan_cancel_at_period_end = 0, stripe_customer_id = COALESCE(?, stripe_customer_id) WHERE id = ?`,
    session.customer,
    owner.id,
  );
  await releaseHeldResponses(owner.id);
}

/** A fully refunded Lifetime payment takes the account back to Free. */
export async function revokeRefundedLifetime(charge: { payment_intent?: string | null; refunded?: boolean }) {
  if (!charge.refunded || !charge.payment_intent) return;
  const pi = await stripe<{ metadata?: Record<string, string> }>("GET", `payment_intents/${charge.payment_intent}`);
  if (pi.metadata?.formloom_plan !== "lifetime" || !pi.metadata.formloom_user_id) return;
  const userId = pi.metadata.formloom_user_id;
  if (!(await hasLifetime(userId))) return;
  await (await db()).run(
    `UPDATE users SET plan = 'free', plan_status = 'refunded', plan_interval = NULL WHERE id = ?`,
    userId,
  );
}

export async function fetchCheckoutSession(id: string) {
  return stripe<StripeCheckoutSession>("GET", `checkout/sessions/${id}`);
}

/** Catches up after Checkout returns, in case the webhook hasn't arrived yet. */
export async function syncFromStripe(userId: string) {
  const row = await (await db()).get<{ stripe_customer_id: string | null }>(
    "SELECT stripe_customer_id FROM users WHERE id = ?",
    userId,
  );
  if (!row?.stripe_customer_id) return;
  const list = await stripe<{ data: StripeSubscription[] }>("GET", "subscriptions", {
    customer: row.stripe_customer_id,
    status: "all",
    limit: 1,
  });
  if (list.data[0]) await syncSubscription(list.data[0]);
  if (await hasLifetime(userId)) return;
  const sessions = await stripe<{ data: StripeCheckoutSession[] }>("GET", "checkout/sessions", {
    customer: row.stripe_customer_id,
    limit: 5,
  });
  for (const session of sessions.data) await grantLifetime(session);
}

export async function fetchSubscription(id: string) {
  return stripe<StripeSubscription>("GET", `subscriptions/${id}`);
}

export type StripeEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

/** Verifies the Stripe-Signature header (HMAC-SHA256 over `t.body`, 5 minute tolerance). */
export async function verifyStripeEvent(raw: string, header: string | null): Promise<StripeEvent | null> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return null;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > 300) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${raw}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const same = (a: string, b: string) => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  };
  if (!sigs.some((s) => same(s, expected))) return null;
  return JSON.parse(raw) as StripeEvent;
}

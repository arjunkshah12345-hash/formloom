/**
 * Pricing for the hosted version (Formloom Cloud). Safe to import anywhere.
 * Self-hosted installs have no plans: every feature is on and nothing is metered.
 */
export const FREE_MONTHLY_RESPONSES = 1000;

export const PRO_PRICE = {
  /** USD cents per month, billed monthly. */
  month: 800,
  /** USD cents per year, billed yearly ($6/month). */
  year: 7200,
} as const;

export type BillingInterval = keyof typeof PRO_PRICE;

/** USD cents, paid once: Pro for the life of the hosted service. */
export const LIFETIME_PRICE = 9900;

/** What a Checkout can sell. */
export type Purchase = BillingInterval | "lifetime";

/** Stripe price lookup keys, created by scripts/stripe-setup.sh. */
export const PRICE_LOOKUP_KEYS: Record<Purchase, string> = {
  month: "formloom_pro_month",
  year: "formloom_pro_year",
  lifetime: "formloom_pro_lifetime",
};

/** Half off the first Pro payment, made by scripts/stripe-setup.sh. */
export const LAUNCH_CODE = "LAUNCH50";

/**
 * The launch offer runs until this instant. Until then Checkout applies LAUNCH_CODE by itself and the
 * site shows the launch banner and launch prices; afterwards both disappear on their own.
 */
export const LAUNCH_ENDS = "2026-12-15T08:00:00Z";
export const launchActive = (now = Date.now()) => now < Date.parse(LAUNCH_ENDS);
/** "December 15", for copy. */
export const launchEndsLabel = () =>
  new Date(Date.parse(LAUNCH_ENDS) - 1).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/Los_Angeles" });

/**
 * The cheapest paid plan elsewhere, USD per month at its lowest advertised billing (checked November 2026).
 * Update when they change; the landing page reads from here.
 */
export const COMPETITOR_PRICES: { name: string; from: number }[] = [
  { name: "Fillout", from: 15 },
  { name: "Youform", from: 20 },
  { name: "Tally", from: 24 },
  { name: "Typeform", from: 28 },
  { name: "Jotform", from: 34 },
];

export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

export const PLAN_FEATURES = {
  free: [
    `${FREE_MONTHLY_RESPONSES.toLocaleString("en-US")} responses a month`,
    "Unlimited forms and questions",
    "All 16 question types, logic and themes",
    "Webhooks, REST API and CSV export",
    "Agent setup prompt",
  ],
  pro: [
    "Unlimited responses",
    "Remove the “Made with Formloom” badge",
    "Everything in Free",
    "Cancel anytime, keep every response",
    "Funds the open-source project",
  ],
  lifetime: [
    "Everything in Pro, for good",
    "Pay once, never renew",
    "Unlimited responses, no badge",
  ],
} as const;

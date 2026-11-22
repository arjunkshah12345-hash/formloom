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
} as const;

#!/usr/bin/env bash
# Switches the deployed Worker to live Stripe billing.
# Run after `scripts/stripe-setup.sh <url> --live`, from the repo root.
#
# Asks for a live secret key (Stripe Dashboard → Developers → API keys; a restricted key works
# with write access to Customers, Checkout Sessions, Customer portal and Subscriptions, and read
# access to Prices, Payment Intents and Charges). Nothing is echoed or written to disk.
set -euo pipefail

SECRET_FILE="${FORMLOOM_WEBHOOK_SECRET_FILE:-$HOME/.config/formloom/stripe-live-webhook-secret}"
[[ -s "$SECRET_FILE" ]] || { echo "No webhook secret at $SECRET_FILE. Run scripts/stripe-setup.sh --live first." >&2; exit 1; }

# An unrelated CLOUDFLARE_API_TOKEN in the shell (e.g. a Workers AI token) overrides `wrangler login` and
# can't write Worker secrets. If it has no access to this Worker, fall back to the wrangler login.
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] && ! npx wrangler secret list >/dev/null 2>&1; then
  echo "CLOUDFLARE_API_TOKEN can't manage this Worker; using your wrangler login instead."
  unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
fi

read -rsp "Live Stripe secret key (sk_live_… or rk_live_…): " KEY; echo
[[ "$KEY" == sk_live_* || "$KEY" == rk_live_* ]] || { echo "That isn't a live key." >&2; exit 1; }

code=$(curl -s -o /dev/null -w "%{http_code}" -u "$KEY:" "https://api.stripe.com/v1/prices?lookup_keys[]=formloom_pro_year&limit=1")
[[ "$code" == 200 ]] || { echo "Stripe rejected the key (HTTP $code)." >&2; exit 1; }

printf '%s' "$KEY" | npx wrangler secret put STRIPE_SECRET_KEY
tr -d '\n' < "$SECRET_FILE" | npx wrangler secret put STRIPE_WEBHOOK_SECRET
unset KEY
echo "Live billing is on. Secrets apply to the running Worker immediately."

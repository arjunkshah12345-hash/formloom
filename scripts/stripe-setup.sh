#!/usr/bin/env bash
# Sets up Formloom Cloud billing in a Stripe account with the Stripe CLI.
# Safe to run more than once: existing prices, coupons and webhooks are reused.
#
#   scripts/stripe-setup.sh https://forms.example.com          # test mode
#   scripts/stripe-setup.sh https://forms.example.com --live   # live mode
#
# Creates:
#   - "Formloom Pro" with monthly and yearly prices (lookup keys formloom_pro_month / _year)
#   - "Formloom Pro Lifetime", a one-time price (lookup key formloom_pro_lifetime)
#   - the LAUNCH50 promotion code: half off the first Pro payment
#   - a customer portal (cards, invoices, cancel, switch monthly <-> yearly)
#   - the webhook endpoint; prints its signing secret once, on creation
#
# Prices must match src/lib/plans.ts.
set -euo pipefail

APP_URL="${1:?usage: stripe-setup.sh <app url> [--live]}"
APP_URL="${APP_URL%/}"
MODE=()
[[ "${2:-}" == "--live" ]] && MODE=(--live)

MONTH_CENTS=800
YEAR_CENTS=7200
LIFETIME_CENTS=9900

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
s() { stripe "$@" ${MODE[@]+"${MODE[@]}"} >"$tmp" 2>/dev/null || { cat "$tmp" >&2; exit 1; }; }
j() { jq -r "$1" "$tmp"; }

product() { # name, metadata key -> product id
  s get /v1/products -d active=true -d limit=100
  local id; id=$(jq -r --arg k "$2" '[.data[] | select(.metadata.formloom == $k)][0].id // empty' "$tmp")
  if [[ -z "$id" ]]; then
    s post /v1/products -d "name=$1" -d "metadata[formloom]=$2" -d "tax_code=txcd_10103001"
    id=$(j .id)
  fi
  echo "$id"
}

price() { # product, lookup key, cents, interval|"" -> price id
  s get /v1/prices -d "lookup_keys[]=$2" -d active=true
  local id; id=$(j '.data[0].id // empty')
  local amount; amount=$(j '.data[0].unit_amount // empty')
  if [[ -n "$id" && "$amount" == "$3" ]]; then echo "$id"; return; fi
  local args=(-d "product=$1" -d currency=usd -d "unit_amount=$3" -d "lookup_key=$2" -d transfer_lookup_key=true)
  [[ -n "$4" ]] && args+=(-d "recurring[interval]=$4")
  s post /v1/prices "${args[@]}"
  j .id
}

echo "→ Products and prices"
PRO=$(product "Formloom Pro" pro)
LIFE=$(product "Formloom Pro Lifetime" lifetime)
P_MONTH=$(price "$PRO" formloom_pro_month $MONTH_CENTS month)
P_YEAR=$(price "$PRO" formloom_pro_year $YEAR_CENTS year)
P_LIFE=$(price "$LIFE" formloom_pro_lifetime $LIFETIME_CENTS "")
echo "  Pro monthly  $P_MONTH"
echo "  Pro yearly   $P_YEAR"
echo "  Lifetime     $P_LIFE"

echo "→ Launch promotion (LAUNCH50: half off the first Pro payment)"
s get /v1/promotion_codes -d code=LAUNCH50 -d active=true
if [[ -z "$(j '.data[0].id // empty')" ]]; then
  s post /v1/coupons -d name="Launch: 50% off your first payment" -d percent_off=50 -d duration=once \
    -d "applies_to[products][]=$PRO"
  COUPON=$(j .id)
  s post /v1/promotion_codes -d "promotion[type]=coupon" -d "promotion[coupon]=$COUPON" -d code=LAUNCH50 \
    -d max_redemptions=500 -d "restrictions[first_time_transaction]=true"
fi
echo "  LAUNCH50 active"

echo "→ Customer portal"
portal=(
  -d "business_profile[headline]=Manage your Formloom plan"
  -d "default_return_url=$APP_URL/account"
  -d "features[invoice_history][enabled]=true"
  -d "features[payment_method_update][enabled]=true"
  -d "features[customer_update][enabled]=true"
  -d "features[customer_update][allowed_updates][]=email"
  -d "features[customer_update][allowed_updates][]=address"
  -d "features[customer_update][allowed_updates][]=tax_id"
  -d "features[subscription_cancel][enabled]=true"
  -d "features[subscription_cancel][mode]=at_period_end"
  -d "features[subscription_cancel][cancellation_reason][enabled]=true"
  -d "features[subscription_cancel][cancellation_reason][options][]=too_expensive"
  -d "features[subscription_cancel][cancellation_reason][options][]=missing_features"
  -d "features[subscription_cancel][cancellation_reason][options][]=switched_service"
  -d "features[subscription_cancel][cancellation_reason][options][]=unused"
  -d "features[subscription_cancel][cancellation_reason][options][]=other"
  -d "features[subscription_update][enabled]=true"
  -d "features[subscription_update][default_allowed_updates][]=price"
  -d "features[subscription_update][proration_behavior]=create_prorations"
  -d "features[subscription_update][products][0][product]=$PRO"
  -d "features[subscription_update][products][0][prices][]=$P_MONTH"
  -d "features[subscription_update][products][0][prices][]=$P_YEAR"
)
s get /v1/billing_portal/configurations -d is_default=true -d limit=1
CFG=$(j '.data[0].id // empty')
if [[ -n "$CFG" ]]; then s post "/v1/billing_portal/configurations/$CFG" "${portal[@]}"; else s post /v1/billing_portal/configurations "${portal[@]}"; fi
echo "  $(j .id)"

echo "→ Webhook"
HOOK_URL="$APP_URL/api/billing/webhook"
events=(
  -d "enabled_events[]=checkout.session.completed"
  -d "enabled_events[]=checkout.session.async_payment_succeeded"
  -d "enabled_events[]=customer.subscription.created"
  -d "enabled_events[]=customer.subscription.updated"
  -d "enabled_events[]=customer.subscription.deleted"
  -d "enabled_events[]=charge.refunded"
)
s get /v1/webhook_endpoints -d limit=100
WH=$(jq -r --arg u "$HOOK_URL" '[.data[] | select(.url == $u)][0].id // empty' "$tmp")
if [[ -n "$WH" ]]; then
  s post "/v1/webhook_endpoints/$WH" "${events[@]}"
  echo "  $WH updated (signing secret unchanged)"
else
  s post /v1/webhook_endpoints -d "url=$HOOK_URL" -d "description=Formloom billing" "${events[@]}"
  echo "  $(j .id) created"
  echo
  echo "  Signing secret (set it as STRIPE_WEBHOOK_SECRET, it isn't shown again):"
  echo "  $(j .secret)"
fi
echo
echo "Done. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET on the app, e.g."
echo "  npx wrangler secret put STRIPE_SECRET_KEY"

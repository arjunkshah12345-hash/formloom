import { fetchSubscription, syncSubscription, verifyStripeEvent } from "@/lib/billing";

/** Stripe webhook: keeps each user's plan in step with their subscription. */
export async function POST(req: Request) {
  const raw = await req.text();
  const event = await verifyStripeEvent(raw, req.headers.get("stripe-signature"));
  if (!event) return Response.json({ error: "Invalid signature" }, { status: 400 });

  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
      if (typeof obj.subscription === "string") await syncSubscription(await fetchSubscription(obj.subscription));
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // Re-fetch so out-of-order deliveries still land on the latest state.
      await syncSubscription(await fetchSubscription(obj.id as string));
      break;
  }
  return Response.json({ received: true });
}

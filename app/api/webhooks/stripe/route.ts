import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillCheckoutSession } from "@/lib/fulfillment/fulfillCheckoutSession";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/*
 * Local webhook testing:
 * 1. Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * 2. Copy the printed whsec_... value into STRIPE_WEBHOOK_SECRET in .env.local.
 * 3. Restart npm run dev so Next.js reads the new env value.
 * 4. Complete Checkout with Stripe test card 4242 4242 4242 4242.
 */
export async function POST(request: Request) {
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe secret key is not configured." }, { status: 500 });
  }

  if (!stripeWebhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const eventSession = event.data.object as Stripe.Checkout.Session;
    const session = await stripe.checkout.sessions.retrieve(eventSession.id, {
      expand: ["payment_intent"]
    });

    await fulfillCheckoutSession(stripe, session);
  }

  return NextResponse.json({ received: true, eventType: event.type });
}

# Free The Beach

Mostly single-page merch storefront for coastal apparel and accessories.

## Stack

- Next.js App Router
- Stripe Checkout scaffold
- Dropship product API adapter placeholder
- Static coastal brand assets in `public/assets`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Hero Video

Add the looping hero video at:

```text
public/videos/hero-loop.mp4
```

The page will show the current brand artwork behind the hero until that video exists.

## Payments

Copy `.env.example` to `.env.local` and fill in:

```text
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

The checkout route is implemented at `app/api/checkout/route.ts`. It uses the local product catalog until a dropship provider is selected.

## Stripe Webhooks

For local fulfillment testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `.env.local`, restart `npm run dev`, then complete Checkout with Stripe test card `4242 4242 4242 4242`.

The webhook route listens for `checkout.session.completed`, retrieves Checkout line items from Stripe, and passes a provider-neutral payload into the dropship scaffold at `lib/dropship/createDropshipOrder.ts`.

## Order Persistence

Webhook fulfillment persists orders to Supabase Postgres through the server-only store in `lib/orders/orderStore.ts`. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`; never expose the service role key to client code.

Apply the orders table migration in `supabase/migrations/20260610000000_create_orders.sql` before testing webhooks against Supabase. The unique `stripe_checkout_session_id` column is the idempotency key that prevents duplicate dropship submissions.

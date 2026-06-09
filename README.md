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

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProduct } from "@/lib/products";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(request: Request) {
  const { productId, quantity = 1 } = (await request.json()) as {
    productId?: string;
    quantity?: number;
  };

  if (!productId) {
    return NextResponse.json({ error: "Missing productId." }, { status: 400 });
  }

  const product = getProduct(productId);

  if (!product) {
    return NextResponse.json({ error: "Unknown product." }, { status: 404 });
  }

  if (!product.active) {
    return NextResponse.json({ error: "Product is not available." }, { status: 410 });
  }

  if (!stripeSecretKey) {
    return NextResponse.json(
      {
        error: "Stripe is not configured yet.",
        message: "Add STRIPE_SECRET_KEY to .env.local to enable checkout."
      },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity,
        price_data: {
          currency: product.currency,
          unit_amount: product.price,
          product_data: {
            name: product.name,
            description: product.description,
            images: [`${origin}${product.image}`],
            metadata: {
              productId: product.id,
              variantId: product.variantId,
              providerSku: product.providerSku
            }
          }
        }
      }
    ],
    shipping_address_collection: {
      allowed_countries: ["US"]
    },
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    metadata: {
      productId: product.id,
      variantId: product.variantId,
      providerSku: product.providerSku
    }
  });

  return NextResponse.json({ url: session.url });
}

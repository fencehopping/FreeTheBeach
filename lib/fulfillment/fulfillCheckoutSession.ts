import Stripe from "stripe";
import { createDropshipOrder } from "@/lib/dropship/createDropshipOrder";
import { getProduct } from "@/lib/products";

export async function fulfillCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  // TODO: Check persistent storage before fulfillment. Use session.id as the idempotency key,
  // and store the provider order ID after createDropshipOrder succeeds.
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100
  });

  const product = session.metadata?.productId ? getProduct(session.metadata.productId) : undefined;

  const payload = {
    source: {
      provider: "stripe" as const,
      checkoutSessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id
    },
    customer: {
      email: session.customer_details?.email ?? session.customer_email ?? undefined,
      name: session.customer_details?.name ?? session.shipping_details?.name ?? undefined
    },
    shippingAddress: session.shipping_details?.address
      ? {
          name: session.shipping_details.name ?? undefined,
          line1: session.shipping_details.address.line1 ?? undefined,
          line2: session.shipping_details.address.line2 ?? undefined,
          city: session.shipping_details.address.city ?? undefined,
          state: session.shipping_details.address.state ?? undefined,
          postalCode: session.shipping_details.address.postal_code ?? undefined,
          country: session.shipping_details.address.country ?? undefined
        }
      : undefined,
    lineItems: lineItems.data.map((lineItem) => ({
      productId: session.metadata?.productId ?? product?.id,
      variantId: session.metadata?.variantId ?? product?.variantId,
      providerSku: session.metadata?.providerSku ?? product?.providerSku,
      name: lineItem.description ?? product?.name ?? "Unknown product",
      quantity: lineItem.quantity ?? 1,
      unitAmount: lineItem.price?.unit_amount ?? undefined,
      currency: lineItem.currency ?? lineItem.price?.currency ?? product?.currency,
      stripeLineItemId: lineItem.id
    }))
  };

  const dropshipOrder = await createDropshipOrder(payload);

  console.info("Dropship fulfillment scaffold complete", {
    checkoutSessionId: session.id,
    provider: dropshipOrder.provider,
    providerOrderId: dropshipOrder.providerOrderId
  });

  return dropshipOrder;
}

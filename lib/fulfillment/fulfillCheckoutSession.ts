import Stripe from "stripe";
import {
  createDropshipOrder,
  type DropshipOrderPayload
} from "@/lib/dropship/createDropshipOrder";
import {
  getOrderByStripeCheckoutSessionId,
  updateOrderByStripeCheckoutSessionId,
  upsertOrderByStripeCheckoutSessionId
} from "@/lib/orders/orderStore";
import { getProduct } from "@/lib/products";

export async function fulfillCheckoutSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  const existingOrder = await getOrderByStripeCheckoutSessionId(session.id);

  if (
    existingOrder?.fulfillmentStatus === "fulfillment_submitted" &&
    existingOrder.providerOrderId
  ) {
    console.info("Order already fulfilled, skipping dropship call", {
      stripeCheckoutSessionId: session.id,
      providerOrderId: existingOrder.providerOrderId
    });

    return {
      provider: "stored",
      providerOrderId: existingOrder.providerOrderId
    };
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100
  });

  const product = session.metadata?.productId ? getProduct(session.metadata.productId) : undefined;
  const paymentStatus = session.payment_status === "paid" ? "paid" : "pending_payment";

  const payload: DropshipOrderPayload = {
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

  const { order, created } = await upsertOrderByStripeCheckoutSessionId({
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: payload.source.paymentIntentId,
    customerEmail: payload.customer.email,
    customerName: payload.customer.name,
    shippingName: payload.shippingAddress?.name,
    shippingAddressJson: payload.shippingAddress
      ? JSON.stringify(payload.shippingAddress, null, 2)
      : undefined,
    lineItemsJson: JSON.stringify(payload.lineItems, null, 2),
    variantId: session.metadata?.variantId ?? product?.variantId,
    providerSku: session.metadata?.providerSku ?? product?.providerSku,
    amountTotal: session.amount_total ?? undefined,
    currency: session.currency ?? product?.currency,
    paymentStatus,
    fulfillmentStatus:
      existingOrder?.fulfillmentStatus === "fulfillment_failed"
        ? "fulfillment_pending"
        : (existingOrder?.fulfillmentStatus ?? "fulfillment_pending"),
    providerOrderId: existingOrder?.providerOrderId,
    providerResponseJson: existingOrder?.providerResponseJson,
    fulfillmentError: undefined
  });

  console.info(created ? "Created order from Stripe session" : "Updated order from Stripe session", {
    orderId: order.id,
    stripeCheckoutSessionId: session.id,
    paymentStatus
  });

  if (paymentStatus !== "paid") {
    return {
      provider: "deferred",
      providerOrderId: order.providerOrderId ?? `pending_${session.id}`
    };
  }

  try {
    const dropshipOrder = await createDropshipOrder(payload);

    await updateOrderByStripeCheckoutSessionId(session.id, {
      fulfillmentStatus: "fulfillment_submitted",
      providerOrderId: dropshipOrder.providerOrderId,
      providerResponseJson: JSON.stringify(dropshipOrder, null, 2),
      fulfillmentError: undefined
    });

    console.info("Submitted mock dropship order", {
      orderId: order.id,
      stripeCheckoutSessionId: session.id,
      provider: dropshipOrder.provider,
      providerOrderId: dropshipOrder.providerOrderId
    });

    return dropshipOrder;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fulfillment error";

    await updateOrderByStripeCheckoutSessionId(session.id, {
      fulfillmentStatus: "fulfillment_failed",
      fulfillmentError: message
    });

    console.error("Fulfillment failed", {
      orderId: order.id,
      stripeCheckoutSessionId: session.id,
      error: message
    });

    throw error;
  }
}

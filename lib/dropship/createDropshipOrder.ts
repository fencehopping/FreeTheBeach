export type DropshipOrderPayload = {
  source: {
    provider: "stripe";
    checkoutSessionId: string;
    paymentIntentId?: string;
  };
  customer: {
    email?: string;
    name?: string;
  };
  shippingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  lineItems: Array<{
    productId?: string;
    variantId?: string;
    providerSku?: string;
    name: string;
    quantity: number;
    unitAmount?: number;
    currency?: string;
    stripeLineItemId: string;
  }>;
};

export async function createDropshipOrder(payload: DropshipOrderPayload) {
  // TODO: Replace this mock with the Apliiq API request once live SKUs and API credentials exist.
  // Keep this server-side only. Do not expose provider SKUs or API credentials to the client.
  console.info("Mock dropship order payload", JSON.stringify(payload, null, 2));

  return {
    provider: "mock",
    providerOrderId: `mock_${payload.source.checkoutSessionId}`
  };
}

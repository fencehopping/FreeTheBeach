export const paymentStatuses = ["pending_payment", "paid"] as const;
export const fulfillmentStatuses = [
  "fulfillment_pending",
  "fulfillment_submitted",
  "fulfillment_failed"
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];
export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export type StoredOrder = {
  id: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string;
  customerEmail?: string;
  customerName?: string;
  shippingName?: string;
  shippingAddressJson?: string;
  lineItemsJson: string;
  variantId?: string;
  providerSku?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  providerOrderId?: string;
  providerResponseJson?: string;
  fulfillmentError?: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderInput = Omit<StoredOrder, "id" | "createdAt" | "updatedAt">;

export type OrderPatch = Partial<
  Pick<
    StoredOrder,
    | "stripePaymentIntentId"
    | "customerEmail"
    | "customerName"
    | "shippingName"
    | "shippingAddressJson"
    | "lineItemsJson"
    | "variantId"
    | "providerSku"
    | "amountTotal"
    | "currency"
    | "paymentStatus"
    | "fulfillmentStatus"
    | "providerOrderId"
    | "providerResponseJson"
    | "fulfillmentError"
  >
>;

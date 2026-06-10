import "server-only";
import type { OrderInput, OrderPatch, StoredOrder } from "@/lib/orders/types";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SupabaseOrderRow = {
  id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  shipping_name: string | null;
  shipping_address_json: unknown;
  line_items_json: unknown;
  variant_id: string | null;
  provider_sku: string | null;
  amount_total: number | null;
  currency: string | null;
  payment_status: StoredOrder["paymentStatus"];
  fulfillment_status: StoredOrder["fulfillmentStatus"];
  provider_order_id: string | null;
  provider_response_json: unknown;
  fulfillment_error: string | null;
  created_at: string;
  updated_at: string;
};

function getSupabaseRestUrl(path: string) {
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not configured.");
  }

  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
}

function getSupabaseHeaders(extra?: HeadersInit) {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function parseJsonField(value: string | undefined) {
  if (!value) {
    return null;
  }

  return JSON.parse(value) as unknown;
}

function stringifyJsonField(value: unknown) {
  return value === null || value === undefined ? undefined : JSON.stringify(value, null, 2);
}

function toStoredOrder(row: SupabaseOrderRow): StoredOrder {
  return {
    id: row.id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    customerName: row.customer_name ?? undefined,
    shippingName: row.shipping_name ?? undefined,
    shippingAddressJson: stringifyJsonField(row.shipping_address_json),
    lineItemsJson: stringifyJsonField(row.line_items_json) ?? "[]",
    variantId: row.variant_id ?? undefined,
    providerSku: row.provider_sku ?? undefined,
    amountTotal: row.amount_total ?? undefined,
    currency: row.currency ?? undefined,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    providerOrderId: row.provider_order_id ?? undefined,
    providerResponseJson: stringifyJsonField(row.provider_response_json),
    fulfillmentError: row.fulfillment_error ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toSupabaseInsert(input: OrderInput) {
  return {
    stripe_checkout_session_id: input.stripeCheckoutSessionId,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    customer_email: input.customerEmail ?? null,
    customer_name: input.customerName ?? null,
    shipping_name: input.shippingName ?? null,
    shipping_address_json: parseJsonField(input.shippingAddressJson),
    line_items_json: parseJsonField(input.lineItemsJson),
    variant_id: input.variantId ?? null,
    provider_sku: input.providerSku ?? null,
    amount_total: input.amountTotal ?? null,
    currency: input.currency ?? null,
    payment_status: input.paymentStatus,
    fulfillment_status: input.fulfillmentStatus,
    provider_order_id: input.providerOrderId ?? null,
    provider_response_json: parseJsonField(input.providerResponseJson),
    fulfillment_error: input.fulfillmentError ?? null
  };
}

function toSupabasePatch(patch: OrderPatch) {
  const row: Record<string, unknown> = {};

  if ("stripePaymentIntentId" in patch) row.stripe_payment_intent_id = patch.stripePaymentIntentId ?? null;
  if ("customerEmail" in patch) row.customer_email = patch.customerEmail ?? null;
  if ("customerName" in patch) row.customer_name = patch.customerName ?? null;
  if ("shippingName" in patch) row.shipping_name = patch.shippingName ?? null;
  if ("shippingAddressJson" in patch) {
    row.shipping_address_json = parseJsonField(patch.shippingAddressJson);
  }
  if ("lineItemsJson" in patch) row.line_items_json = parseJsonField(patch.lineItemsJson);
  if ("variantId" in patch) row.variant_id = patch.variantId ?? null;
  if ("providerSku" in patch) row.provider_sku = patch.providerSku ?? null;
  if ("amountTotal" in patch) row.amount_total = patch.amountTotal ?? null;
  if ("currency" in patch) row.currency = patch.currency ?? null;
  if ("paymentStatus" in patch) row.payment_status = patch.paymentStatus;
  if ("fulfillmentStatus" in patch) row.fulfillment_status = patch.fulfillmentStatus;
  if ("providerOrderId" in patch) row.provider_order_id = patch.providerOrderId ?? null;
  if ("providerResponseJson" in patch) {
    row.provider_response_json = parseJsonField(patch.providerResponseJson);
  }
  if ("fulfillmentError" in patch) row.fulfillment_error = patch.fulfillmentError ?? null;

  return row;
}

async function readSupabaseOrder(url: string, init?: RequestInit) {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Supabase order request failed: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as SupabaseOrderRow[];
  return rows[0] ? toStoredOrder(rows[0]) : undefined;
}

export async function getOrderByStripeCheckoutSessionId(stripeCheckoutSessionId: string) {
  const query = new URLSearchParams({
    stripe_checkout_session_id: `eq.${stripeCheckoutSessionId}`,
    select: "*",
    limit: "1"
  });

  return readSupabaseOrder(getSupabaseRestUrl(`orders?${query}`), {
    headers: getSupabaseHeaders()
  });
}

export async function upsertOrderByStripeCheckoutSessionId(input: OrderInput) {
  const existing = await getOrderByStripeCheckoutSessionId(input.stripeCheckoutSessionId);
  const query = new URLSearchParams({
    on_conflict: "stripe_checkout_session_id",
    select: "*"
  });

  const response = await fetch(getSupabaseRestUrl(`orders?${query}`), {
    method: "POST",
    headers: getSupabaseHeaders({
      Prefer: "resolution=merge-duplicates,return=representation"
    }),
    body: JSON.stringify(toSupabaseInsert(input))
  });

  if (!response.ok) {
    throw new Error(`Supabase order upsert failed: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as SupabaseOrderRow[];
  const order = toStoredOrder(rows[0]);

  console.info(existing ? "Updated Supabase order" : "Created Supabase order", {
    orderId: order.id,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId
  });

  return { order, created: !existing };
}

export async function updateOrderByStripeCheckoutSessionId(
  stripeCheckoutSessionId: string,
  patch: OrderPatch
) {
  const query = new URLSearchParams({
    stripe_checkout_session_id: `eq.${stripeCheckoutSessionId}`,
    select: "*"
  });

  const response = await fetch(getSupabaseRestUrl(`orders?${query}`), {
    method: "PATCH",
    headers: getSupabaseHeaders({
      Prefer: "return=representation"
    }),
    body: JSON.stringify(toSupabasePatch(patch))
  });

  if (!response.ok) {
    throw new Error(`Supabase order update failed: ${response.status} ${await response.text()}`);
  }

  const rows = (await response.json()) as SupabaseOrderRow[];

  if (!rows[0]) {
    throw new Error(`Order not found for Stripe Checkout Session ${stripeCheckoutSessionId}`);
  }

  const order = toStoredOrder(rows[0]);

  console.info("Updated Supabase order", {
    orderId: order.id,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId,
    fulfillmentStatus: order.fulfillmentStatus
  });

  return order;
}

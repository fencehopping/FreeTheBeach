import { products } from "@/lib/products";

export async function listProducts() {
  const apiBaseUrl = process.env.DROPSHIP_API_BASE_URL;

  if (!apiBaseUrl) {
    return products;
  }

  // Provider-specific mapping belongs here once Printful, Shopify, Gelato,
  // ShipStation, or another dropship source is selected.
  throw new Error("DROPSHIP_API_BASE_URL is set, but no dropship adapter has been configured.");
}

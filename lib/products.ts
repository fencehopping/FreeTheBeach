export type Product = {
  id: string;
  variantId: string;
  name: string;
  description: string;
  price: number;
  currency: "usd";
  providerSku: string;
  active: boolean;
  image: string;
  category: "stickers" | "hats" | "sun shirts" | "koozies";
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "flip-sticker",
    variantId: "flip-sticker-standard",
    name: "Flip Icon Sticker",
    description:
      "The mark of the movement. A weatherproof vinyl Flip for your cooler, your tailgate, or your bumper. Small bird, big point.",
    price: 600,
    currency: "usd",
    providerSku: "APLIIQ-TODO-FLIP-STICKER",
    active: true,
    image: "/assets/logo.png",
    category: "stickers",
    featured: true
  },
  {
    id: "shared-shorelines-hat",
    variantId: "shared-shorelines-hat-standard",
    name: "Shared Shorelines Rope Hat",
    description:
      "Shaded common sense for beach people. A coastal rope hat with the upside-down plover mark up front.",
    price: 3400,
    currency: "usd",
    providerSku: "APLIIQ-TODO-ROPE-HAT",
    active: true,
    image: "/assets/plover-sticker-tall.png",
    category: "hats",
    featured: true
  },
  {
    id: "all-day-sun-shirt",
    variantId: "all-day-sun-shirt-standard",
    name: "All-Day Sun Shirt",
    description:
      "All-day coverage for all-day beach people. Lightweight long-sleeve gear for boating, fishing, and refusing to leave before sunset.",
    price: 4800,
    currency: "usd",
    providerSku: "APLIIQ-TODO-SUN-SHIRT",
    active: true,
    image: "/assets/plover-white.png",
    category: "sun shirts"
  },
  {
    id: "duxbury-town-sticker",
    variantId: "duxbury-town-sticker-standard",
    name: "Duxbury Town Sticker",
    description:
      "Duxbury, you beautiful, over-regulated stretch of sand. Local pride for people who love this beach enough to want to actually use it.",
    price: 800,
    currency: "usd",
    providerSku: "APLIIQ-TODO-DUXBURY-STICKER",
    active: true,
    image: "/assets/duxbury-flag.png",
    category: "stickers"
  },
  {
    id: "cold-drink-koozie",
    variantId: "cold-drink-koozie-standard",
    name: "Cold Drink Koozie",
    description:
      "Cold drink, warm take. Keeps your beverage colder than the local beach-access policy.",
    price: 1000,
    currency: "usd",
    providerSku: "APLIIQ-TODO-KOOZIE",
    active: true,
    image: "/assets/plover-sticker-tall.png",
    category: "koozies"
  }
];

export function getProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

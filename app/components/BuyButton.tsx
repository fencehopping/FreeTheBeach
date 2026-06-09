"use client";

import { useState } from "react";

type BuyButtonProps = {
  productId: string;
};

export function BuyButton({ productId }: BuyButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleCheckout() {
    setStatus("loading");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout unavailable.");
      }

      window.location.href = data.url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <button className="buy-button" disabled={status === "loading"} onClick={handleCheckout}>
      {status === "loading" ? "Opening..." : status === "error" ? "Checkout soon" : "Buy"}
    </button>
  );
}

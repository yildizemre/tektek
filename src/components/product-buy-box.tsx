"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import type { CartLine } from "@/lib/types";

import { AddToCartButton } from "./add-to-cart";
import { useCart } from "./cart-context";

export function ProductBuyBox({
  product,
  stock,
}: {
  product: Omit<CartLine, "quantity">;
  stock: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const { add } = useCart();
  const router = useRouter();
  const soldOut = stock <= 0;

  function buyNow() {
    add(product, quantity);
    router.push("/odeme");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-ink-200 p-1">
          <button
            type="button"
            aria-label="Azalt"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="rounded-full p-2 hover:bg-ink-50"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
          <button
            type="button"
            aria-label="Artır"
            onClick={() => setQuantity((value) => Math.min(Math.max(stock, 1), value + 1))}
            className="rounded-full p-2 hover:bg-ink-50"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <AddToCartButton
          product={product}
          quantity={quantity}
          disabled={soldOut}
          className="flex-1 rounded-full border border-ink-900 px-6 py-3 text-sm font-bold transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:border-ink-200 disabled:text-ink-300"
        />
      </div>

      <button
        type="button"
        onClick={buyNow}
        disabled={soldOut}
        className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ink-200"
      >
        {soldOut ? "Stokta yok" : "Hemen satın al"}
      </button>
    </div>
  );
}

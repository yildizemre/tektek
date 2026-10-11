"use client";

import { ShoppingBag } from "lucide-react";

import type { CartLine } from "@/lib/types";

import { useCart } from "./cart-context";

export function SetBuyButton({ line }: { line: Omit<CartLine, "quantity"> }) {
  const { add, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => {
        add(line, 1);
        openCart();
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-lg font-bold text-ink-900 transition hover:bg-orange-400"
    >
      <ShoppingBag className="size-5" />
      Sepete Ekle
    </button>
  );
}

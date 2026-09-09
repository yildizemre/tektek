"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "./cart-context";
import type { CartLine } from "@/lib/types";

type Props = {
  product: Omit<CartLine, "quantity">;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
};

export function AddToCartButton({ product, quantity = 1, disabled, className, label }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button type="button" onClick={handleClick} disabled={disabled} className={className}>
      <span className="flex items-center justify-center gap-2">
        {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
        {disabled ? "Stokta yok" : added ? "Sepete eklendi" : (label ?? "Sepete ekle")}
      </span>
    </button>
  );
}

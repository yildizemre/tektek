"use client";

import { useEffect } from "react";

import { useCart } from "./cart-context";

/** Rendered on a completed order page so the basket does not linger. */
export function ClearCart() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  return null;
}

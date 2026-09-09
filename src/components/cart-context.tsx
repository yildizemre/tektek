"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "enteknoloji.cart.v1";

type CartState = { lines: CartLine[]; ready: boolean };

const EMPTY: CartState = { lines: [], ready: false };

/**
 * The basket lives in localStorage, which React treats as an external store.
 * Reading it through useSyncExternalStore keeps the server render (empty cart)
 * and the hydrated client render in sync without a flash of wrong content.
 */
const store = (() => {
  let state: CartState = EMPTY;
  const listeners = new Set<() => void>();

  function emit() {
    for (const listener of listeners) listener();
  }

  function setLines(next: CartLine[]) {
    state = { lines: next, ready: true };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // private mode / quota – keep the in-memory cart working anyway
    }
    emit();
  }

  if (typeof window !== "undefined") {
    let restored: CartLine[] = [];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) restored = JSON.parse(stored) as CartLine[];
    } catch {
      restored = [];
    }
    state = { lines: restored, ready: true };
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => state,
    getServerSnapshot: () => EMPTY,
    add(line: Omit<CartLine, "quantity">, quantity: number) {
      const existing = state.lines.find((item) => item.productId === line.productId);
      setLines(
        existing
          ? state.lines.map((item) =>
              item.productId === line.productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...state.lines, { ...line, quantity }],
      );
    },
    setQuantity(productId: number, quantity: number) {
      setLines(
        quantity <= 0
          ? state.lines.filter((item) => item.productId !== productId)
          : state.lines.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
      );
    },
    remove(productId: number) {
      setLines(state.lines.filter((item) => item.productId !== productId));
    },
    clear() {
      setLines([]);
    },
  };
})();

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { lines, ready } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      ready,
      isOpen,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add: (line, quantity = 1) => {
        store.add(line, quantity);
        setIsOpen(true);
      },
      setQuantity: store.setQuantity,
      remove: store.remove,
      clear: store.clear,
    }),
    [lines, ready, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

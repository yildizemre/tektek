"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { formatPrice } from "@/lib/format";

import { useCart } from "./cart-context";
import { Media } from "./media";

export function CartDrawer() {
  const { lines, isOpen, closeCart, setQuantity, remove, subtotal } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Sepeti kapat"
        onClick={closeCart}
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <h2 className="text-base font-bold">Sepetim</h2>
          </div>
          <button type="button" onClick={closeCart} className="rounded-full p-2 hover:bg-ink-50">
            <X className="size-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-ink-50">
              <ShoppingBag className="size-7 text-ink-300" />
            </div>
            <p className="text-sm font-semibold">Sepetiniz boş</p>
            <p className="text-sm text-ink-400">Beğendiğiniz ürünleri sepete ekleyerek başlayın.</p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Alışverişe devam et
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {lines.map((line) => (
                <div key={line.productId} className="flex gap-3 rounded-2xl border border-ink-100 p-3">
                  <Link
                    href={`/urun/${line.slug}`}
                    onClick={closeCart}
                    className="size-20 shrink-0 overflow-hidden rounded-xl"
                  >
                    <Media
                      src={line.image}
                      alt={line.name}
                      accent={line.accent}
                      icon={line.icon}
                      iconClassName="size-7"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/urun/${line.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold hover:text-brand-600"
                    >
                      {line.name}
                    </Link>
                    <span className="mt-0.5 text-sm font-bold">{formatPrice(line.price)}</span>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-ink-100">
                        <button
                          type="button"
                          aria-label="Azalt"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          className="rounded-full p-1.5 hover:bg-ink-50"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Artır"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          className="rounded-full p-1.5 hover:bg-ink-50"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label="Kaldır"
                        onClick={() => remove(line.productId)}
                        className="rounded-full p-2 text-ink-300 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="space-y-3 border-t border-ink-100 px-5 py-4">
              <div className="flex items-center justify-between text-sm text-ink-500">
                <span>Ara toplam</span>
                <span className="text-lg font-bold text-ink-900">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-ink-400">Kargo ücretsiz. Vergiler dahildir.</p>
              <Link
                href="/odeme"
                onClick={closeCart}
                className="block rounded-full bg-ink-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Ödemeye geç
              </Link>
              <Link
                href="/sepet"
                onClick={closeCart}
                className="block rounded-full border border-ink-200 py-3 text-center text-sm font-semibold transition hover:bg-ink-50"
              >
                Sepeti görüntüle
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

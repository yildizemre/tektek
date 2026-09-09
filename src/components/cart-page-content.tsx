"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/format";

import { useCart } from "./cart-context";
import { Media } from "./media";

export function CartPageContent() {
  const { lines, setQuantity, remove, subtotal, clear, ready } = useCart();

  if (!ready) {
    return <div className="container-page py-20 text-center text-sm text-ink-400">Sepet yükleniyor...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-ink-50">
          <ShoppingBag className="size-8 text-ink-300" />
        </div>
        <h1 className="text-2xl font-extrabold">Sepetiniz boş</h1>
        <p className="max-w-sm text-sm text-ink-400">
          Beğendiğiniz ürünleri sepete ekleyin, ödeme adımında karşılaşalım.
        </p>
        <Link href="/arama" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
          Alışverişe başla
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Sepetim</h1>
          <button type="button" onClick={clear} className="text-xs font-semibold text-ink-400 hover:text-red-500">
            Sepeti temizle
          </button>
        </div>

        <div className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100">
          {lines.map((line) => (
            <div key={line.productId} className="flex gap-4 p-4">
              <Link href={`/urun/${line.slug}`} className="size-24 shrink-0 overflow-hidden rounded-2xl">
                <Media
                  src={line.image}
                  alt={line.name}
                  accent={line.accent}
                  icon={line.icon}
                  iconClassName="size-8"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/urun/${line.slug}`} className="text-sm font-semibold hover:text-brand-600">
                  {line.name}
                </Link>
                <span className="mt-1 text-sm text-ink-400">{formatPrice(line.price)} / adet</span>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-1 rounded-full border border-ink-200">
                    <button
                      type="button"
                      aria-label="Azalt"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="rounded-full p-2 hover:bg-ink-50"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-7 text-center text-sm font-bold">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Artır"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="rounded-full p-2 hover:bg-ink-50"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold">{formatPrice(line.price * line.quantity)}</span>
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
            </div>
          ))}
        </div>
      </div>

      <aside className="h-fit space-y-4 rounded-3xl border border-ink-100 p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Sipariş özeti</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>Ara toplam</span>
            <span className="font-semibold text-ink-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Kargo</span>
            <span className="font-semibold text-emerald-600">Ücretsiz</span>
          </div>
        </div>

        <div className="flex justify-between border-t border-ink-100 pt-4 text-base font-bold">
          <span>Toplam</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <Link
          href="/odeme"
          className="block rounded-full bg-ink-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-brand-600"
        >
          Ödemeye geç
        </Link>
        <Link href="/arama" className="block text-center text-xs font-semibold text-ink-400 hover:text-ink-900">
          Alışverişe devam et
        </Link>
      </aside>
    </div>
  );
}

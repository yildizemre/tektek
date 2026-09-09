"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { tierFor, tierUnitPrice } from "@/lib/pricing";
import type { CartLine, ProductTier, ProductVariant } from "@/lib/types";

import { useCart } from "./cart-context";

type Props = {
  product: Omit<CartLine, "quantity" | "key" | "variantId" | "variantName" | "image"> & {
    image: string;
  };
  stock: number;
  variants: ProductVariant[];
  tiers: ProductTier[];
};

export function ProductBuyBox({ product, stock, variants, tiers }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<number | null>(variants[0]?.id ?? null);
  const { add } = useCart();
  const router = useRouter();

  const variant = variants.find((item) => item.id === variantId) ?? null;
  const unit = product.price + (variant?.price_diff ?? 0);
  const activeTier = tierFor(tiers, quantity);
  const finalUnit = tierUnitPrice(unit, tiers, quantity);
  const soldOut = stock <= 0;

  const line = useMemo<Omit<CartLine, "quantity">>(
    () => ({
      key: `${product.productId}:${variant?.id ?? "default"}`,
      productId: product.productId,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? "",
      slug: product.slug,
      name: variant ? `${product.name} — ${variant.name}` : product.name,
      price: unit,
      listPrice: product.listPrice || unit,
      image: variant?.image_url || product.image,
      accent: product.accent,
      icon: product.icon,
      tiers: tiers.map((tier) => ({ quantity: tier.quantity, discount_percent: tier.discount_percent })),
    }),
    [product, unit, variant, tiers],
  );

  function addToCart(qty = quantity) {
    add(line, qty);
  }

  return (
    <div className="space-y-5">
      {variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-bold">
            Renk {variant ? <span className="font-medium text-ink-400">· {variant.name}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVariantId(item.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  variantId === item.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 hover:border-ink-400"
                }`}
              >
                <span
                  className="size-4 rounded-full border border-black/10"
                  style={{ background: item.color_hex || "#ddd" }}
                />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {tiers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold">Daha Fazla Al, Az Öde!</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setQuantity(1)}
              className={`rounded-2xl border p-3 text-left transition ${
                quantity === 1 ? "border-ink-900 bg-ink-50" : "border-ink-100 hover:border-ink-300"
              }`}
            >
              <p className="text-xs font-semibold text-ink-400">1 Adet</p>
              <p className="mt-1 text-sm font-extrabold">{formatPrice(unit)}</p>
            </button>

            {tiers.map((tier) => {
              const price = tierUnitPrice(unit, [tier], tier.quantity) * tier.quantity;
              const list = unit * tier.quantity;
              const selected = quantity === tier.quantity;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setQuantity(tier.quantity)}
                  className={`relative rounded-2xl border p-3 text-left transition ${
                    selected ? "border-ink-900 bg-ink-50" : "border-ink-100 hover:border-ink-300"
                  }`}
                >
                  {tier.badge && (
                    <span className="absolute -top-2 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-fg">
                      {tier.badge}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-ink-400">{tier.quantity} Adet · %{tier.discount_percent} indirim</p>
                  <p className="mt-1 text-sm font-extrabold">{formatPrice(price)}</p>
                  <p className="text-[11px] text-ink-300 line-through">{formatPrice(list)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-3xl bg-ink-50 p-5">
        <div>
          <p className="text-3xl font-extrabold">{formatPrice(finalUnit)}</p>
          {activeTier && (
            <p className="text-xs font-semibold text-emerald-600">
              {quantity} adette %{activeTier.discount_percent} kademeli indirim uygulandı
            </p>
          )}
        </div>
        <p className="text-xs font-semibold text-emerald-600">
          {soldOut ? "Stokta yok" : "Stokta var, gönderilmeye hazır"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-ink-200 p-1">
          <button type="button" aria-label="Azalt" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-full p-2 hover:bg-ink-50">
            <Minus className="size-4" />
          </button>
          <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
          <button type="button" aria-label="Artır" onClick={() => setQuantity((value) => value + 1)} className="rounded-full p-2 hover:bg-ink-50">
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => addToCart()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink-900 px-6 py-3 text-sm font-bold disabled:opacity-40"
        >
          <Check className="size-4" />
          Sepete ekle
        </button>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          addToCart();
          router.push("/odeme");
        }}
        className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-primary disabled:bg-ink-200"
      >
        {soldOut ? "Stokta yok" : "Şimdi sepete ekle"}
      </button>
    </div>
  );
}

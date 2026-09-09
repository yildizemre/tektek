import Link from "next/link";
import { Star } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { priceProduct, type PricedProduct } from "@/lib/pricing";
import type { CartTier, Product } from "@/lib/types";

import { AddToCartButton } from "./add-to-cart";
import { Media } from "./media";

export function ProductCard({
  product,
  accent = "slate",
  icon = "package",
  priced,
  tiers,
}: {
  product: Product;
  accent?: string;
  icon?: string;
  priced?: PricedProduct;
  tiers?: CartTier[];
}) {
  const pricing = priced ?? priceProduct(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition hover:border-ink-200 hover:shadow-[0_18px_50px_-25px_rgba(11,13,24,0.45)]">
      <Link href={`/urun/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <Media
          src={product.image_url}
          alt={product.name}
          accent={accent}
          icon={icon}
          className="transition duration-500 group-hover:scale-[1.04]"
          iconClassName="size-16"
        />

        {pricing.discountPercent !== null && (
          <span className="absolute left-3 top-3 rounded-full bg-ink-900 px-2.5 py-1 text-xs font-bold text-white">
            %{pricing.discountPercent} indirim
          </span>
        )}

        {pricing.campaignBadge && (
          <span className="absolute left-3 top-11 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-fg">
            {pricing.campaignBadge}
          </span>
        )}

        {product.stock <= 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-600">
            Tükendi
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category_name && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            {product.category_name}
          </span>
        )}

        <Link
          href={`/urun/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-xs text-ink-400">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-ink-600">{Number(product.rating).toFixed(1)}</span>
          <span>({product.review_count} değerlendirme)</span>
        </div>

        <div className="mt-auto flex items-end gap-2 pt-2">
          <span className="text-lg font-bold">{formatPrice(pricing.price)}</span>
          {pricing.listPrice && (
            <span className="pb-0.5 text-sm text-ink-300 line-through">
              {formatPrice(pricing.listPrice)}
            </span>
          )}
        </div>

        <AddToCartButton
          product={{
            key: `${product.id}`,
            productId: product.id,
            variantId: null,
            variantName: "",
            slug: product.slug,
            name: product.name,
            price: pricing.price,
            listPrice: pricing.listPrice ?? pricing.price,
            image: product.image_url,
            accent,
            icon,
            tiers,
          }}
          disabled={product.stock <= 0}
          className="mt-3 w-full rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary hover:text-primary-fg disabled:cursor-not-allowed disabled:bg-ink-200"
        />
      </div>
    </article>
  );
}

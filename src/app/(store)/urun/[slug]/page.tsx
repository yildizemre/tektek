import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, CreditCard, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";

import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Rail } from "@/components/rail";
import { discountPercent, formatPrice, parseJsonArray } from "@/lib/format";
import {
  getCategoryById,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };

  return { title: product.name, description: product.short_description };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const category = product.category_id ? await getCategoryById(product.category_id) : null;
  const related = await getRelatedProducts(product);
  const accent = category?.accent ?? "slate";
  const icon = category?.icon ?? "package";

  const gallery = [product.image_url, ...parseJsonArray(product.gallery)].filter(Boolean);
  const images = gallery.length > 0 ? gallery : [""];
  const features = parseJsonArray(product.features);
  const discount = discountPercent(product.price, product.compare_at_price);

  return (
    <div className="container-page space-y-16 py-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <Link href="/" className="hover:text-ink-900">Anasayfa</Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/kategori/${category.slug}`} className="hover:text-ink-900">
              {category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} alt={product.name} accent={accent} icon={icon} />

        <div className="space-y-6">
          <div className="space-y-3">
            {category && (
              <Link
                href={`/kategori/${category.slug}`}
                className="text-xs font-bold uppercase tracking-widest text-brand-600"
              >
                {category.name}
              </Link>
            )}

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-4 ${
                      index < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-ink-200"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
              <span className="text-ink-400">· {product.review_count} değerlendirme</span>
            </div>

            <p className="text-sm leading-relaxed text-ink-500">{product.short_description}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3 rounded-3xl bg-ink-50 p-5">
            <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="pb-1 text-lg text-ink-300 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {discount !== null && (
              <span className="mb-1 rounded-full bg-ink-900 px-3 py-1 text-xs font-bold text-white">
                %{discount} indirim
              </span>
            )}
            <span className="mb-1 ml-auto text-xs font-semibold text-emerald-600">
              {product.stock > 0 ? `Stokta ${product.stock} adet` : "Stokta yok"}
            </span>
          </div>

          <ProductBuyBox
            stock={product.stock}
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image_url,
              accent,
              icon,
            }}
          />

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: Truck, label: "Ücretsiz kargo" },
              { icon: ShieldCheck, label: "2 yıl garanti" },
              { icon: RotateCcw, label: "14 gün iade" },
              { icon: CreditCard, label: "iyzico ile güvenli ödeme" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-ink-100 px-4 py-3">
                <item.icon className="size-4 shrink-0 text-brand-600" />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>

          {features.length > 0 && (
            <div className="space-y-3 rounded-3xl border border-ink-100 p-5">
              <h2 className="text-sm font-bold">Öne çıkan özellikler</h2>
              <ul className="space-y-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-600">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold tracking-tight">Ürün açıklaması</h2>
        <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-ink-500">
          {product.description || product.short_description}
        </div>
        {product.sku && <p className="text-xs text-ink-400">Ürün kodu: {product.sku}</p>}
      </section>

      {related.length > 0 && (
        <Rail title="Benzer ürünler">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} accent={accent} icon={icon} />
          ))}
        </Rail>
      )}
    </div>
  );
}

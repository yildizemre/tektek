import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check, CreditCard, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { ProductBuyBox } from "@/components/product-buy-box";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Rail } from "@/components/rail";
import { parseJsonArray } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { activeCampaigns, priceProduct } from "@/lib/pricing";
import { absoluteUrl } from "@/lib/site";
import {
  getCampaigns,
  getCategoryById,
  getProductBySlug,
  getProductCategoryIds,
  getProductReviews,
  getRelatedProducts,
  getTiers,
  getVariants,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };

  const description = product.seo_description || product.short_description;
  const image = product.image_url || undefined;

  return {
    title: product.seo_title || product.name,
    description,
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: {
      title: product.seo_title || product.name,
      description,
      type: "website",
      url: `/urun/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.seo_title || product.name, description },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.is_active) notFound();

  const [category, related, variants, tiers, reviews, campaigns, categoryIds] = await Promise.all([
    product.category_id ? getCategoryById(product.category_id) : null,
    getRelatedProducts(product),
    getVariants(product.id),
    getTiers(product.id),
    getProductReviews(product.id),
    getCampaigns(true),
    getProductCategoryIds(product.id),
  ]);

  const accent = category?.accent ?? "slate";
  const icon = category?.icon ?? "package";
  const pricing = priceProduct(product, activeCampaigns(campaigns), categoryIds);
  const gallery = [product.image_url, ...variants.map((item) => item.image_url), ...parseJsonArray(product.gallery)].filter(Boolean);
  const images = Array.from(new Set(gallery.length > 0 ? gallery : [""]));
  const features = parseJsonArray(product.features);

  return (
    <div className="container-page space-y-16 py-8">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.short_description,
            image: images.filter(Boolean).map((src) => (src.startsWith("http") ? src : absoluteUrl(src))),
            sku: product.sku || product.slug,
            brand: { "@type": "Brand", name: product.brand || "Tek Teknoloji" },
            offers: {
              "@type": "Offer",
              url: absoluteUrl(`/urun/${product.slug}`),
              priceCurrency: "TRY",
              price: pricing.price.toFixed(2),
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
            aggregateRating:
              reviews.length > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Number(product.rating).toFixed(1),
                    reviewCount: reviews.length,
                  }
                : undefined,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Anasayfa", item: absoluteUrl("/") },
              category
                ? { "@type": "ListItem", position: 2, name: category.name, item: absoluteUrl(`/kategori/${category.slug}`) }
                : undefined,
              { "@type": "ListItem", position: category ? 3 : 2, name: product.name, item: absoluteUrl(`/urun/${product.slug}`) },
            ].filter(Boolean),
          },
        ]}
      />
      <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <Link href="/" className="hover:text-ink-900">Anasayfa</Link>
        <span>/</span>
        {category && (
          <>
            <Link href={`/kategori/${category.slug}`} className="hover:text-ink-900">{category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} alt={product.name} accent={accent} icon={icon} />

        <div className="space-y-6">
          {category && (
            <Link href={`/kategori/${category.slug}`} className="text-xs font-bold uppercase tracking-widest text-primary">
              {category.name}
            </Link>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-4 ${index < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-ink-200"}`}
                />
              ))}
            </div>
            <span className="font-semibold">{Number(product.rating).toFixed(1)}</span>
            <span className="text-ink-400">· {reviews.length} değerlendirme</span>
          </div>

          <p className="text-sm leading-relaxed text-ink-500">{product.short_description}</p>

          <ProductBuyBox
            stock={product.stock}
            variants={variants}
            tiers={tiers}
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: pricing.price,
              listPrice: pricing.listPrice ?? pricing.price,
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
                <item.icon className="size-4 shrink-0 text-primary" />
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
        <div
          className="rich-text max-w-3xl"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(product.description || product.short_description) }}
        />
        {product.sku && <p className="text-xs text-ink-400">Ürün kodu: {product.sku} · Eklenme: {product.created_at.slice(0, 10)}</p>}
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-extrabold tracking-tight">Müşteri Değerlendirmeleri</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-400">Bu ürün için henüz yorum yok.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <figure key={review.id} className="rounded-3xl bg-ink-50 p-5">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                    {review.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <figcaption className="text-sm font-semibold">{review.author}</figcaption>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                {review.title && <p className="mt-3 text-sm font-bold">{review.title}</p>}
                <blockquote className="mt-1 text-sm text-ink-500">{review.body}</blockquote>
              </figure>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <Rail title="Benzer ürünler">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} accent={accent} icon={icon} priced={priceProduct(item, activeCampaigns(campaigns))} />
          ))}
        </Rail>
      )}
    </div>
  );
}

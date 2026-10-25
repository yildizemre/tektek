import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  BadgePercent,
  Camera,
  Gamepad2,
  Gift,
  Headphones,
  Mic,
  Package,
  Plug,
  Plane,
  ShieldCheck,
  Star,
  Tablet,
  Truck,
  Video,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { ProductGallery } from "@/components/product-gallery";
import { SetBuyButton } from "@/components/set-buy-button";
import { formatPrice } from "@/lib/format";
import { responsiveImage } from "@/lib/image";
import { activeCampaigns, priceProduct } from "@/lib/pricing";
import { getCampaigns, getProductBySlug } from "@/lib/queries";
import { ensureCampaignSetProducts, getCampaignSet } from "@/lib/sets";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  tablet: Tablet,
  headphones: Headphones,
  camera: Camera,
  drone: Plane,
  gamepad: Gamepad2,
  star: Star,
  mic: Mic,
  video: Video,
  wind: Wind,
  zap: Zap,
  plug: Plug,
  package: Package,
  percent: BadgePercent,
  gift: Gift,
  truck: Truck,
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const set = getCampaignSet((await params).slug);
  if (!set) return { title: "Set bulunamadı" };
  return { title: set.name, description: set.subtitle, openGraph: { images: [set.banner] } };
}

export default async function SetPage({ params }: PageProps) {
  const set = getCampaignSet((await params).slug);
  if (!set) notFound();

  await ensureCampaignSetProducts().catch(() => undefined);
  const [product, campaigns] = await Promise.all([
    getProductBySlug(set.slug).catch(() => null),
    getCampaigns(true).catch(() => []),
  ]);

  const pricing = product ? priceProduct(product, activeCampaigns(campaigns)) : null;
  const price = pricing?.price ?? set.price;
  const listPrice = pricing?.listPrice ?? product?.compare_at_price ?? set.compareAt;
  const saving = listPrice > price ? listPrice - price : 0;

  return (
    <div className="container-page max-w-3xl space-y-6 py-8">
      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 bg-ink-900 px-6 py-4 text-sm font-semibold">
          <nav className="uppercase tracking-wide text-orange-400">
            <Link href="/" className="hover:text-orange-300">Ana Sayfa</Link>
            {" / "}
            <Link href="/kategori/kampanyali-setler" className="hover:text-orange-300">Kampanyalı Setler</Link>
          </nav>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-400">Özel Kampanya</span>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{set.name}</h1>
            <p className="mt-2 text-ink-500">{set.subtitle}</p>
          </div>

          {set.gallery?.length ? (
            <ProductGallery images={set.gallery} alt={set.name} accent="#f97316" icon="package" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...responsiveImage(set.banner, 1920)} sizes="(max-width: 1408px) 100vw, 1344px" alt={set.name} className="w-full rounded-2xl" />
          )}

          <div
            className={`grid gap-3 rounded-2xl bg-ink-50 p-5 ${set.items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}
          >
            {set.items.map((item) => {
              const Icon = ICONS[item.icon] ?? Package;
              return (
                <div key={item.title} className="flex flex-col items-center gap-2 text-center text-sm font-semibold">
                  <Icon className="size-8" />
                  {item.label}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {saving > 0 && <p className="text-ink-400 line-through">{formatPrice(listPrice)}</p>}
              <p className="text-4xl font-extrabold">{formatPrice(price)}</p>
              {saving > 0 && <p className="mt-1 font-semibold text-emerald-700">{formatPrice(saving)} indirim</p>}
            </div>
            <span className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600">Fırsat Fiyatı</span>
          </div>

          {product ? (
            <SetBuyButton
              line={{
                key: `${product.id}:default`,
                productId: product.id,
                variantId: null,
                variantName: "",
                slug: product.slug,
                name: product.name,
                price,
                listPrice,
                image: set.gallery?.[0] || product.image_url || set.banner,
              }}
            />
          ) : (
            <p className="rounded-2xl bg-ink-50 p-4 text-center text-sm text-ink-500">Bu set şu an satışta değil.</p>
          )}

          <div className="flex flex-wrap justify-between gap-3 text-sm text-ink-600">
            <span className="inline-flex items-center gap-2"><Truck className="size-4" /> Türkiye Geneli Kargo</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" /> Güvenli Ödeme</span>
          </div>
        </div>

        <section className="border-t border-ink-100 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Bu Setin İçinde Neler Var?</h2>
          <ol className="mt-4 divide-y divide-ink-100">
            {set.items.map((item, index) => {
              const Icon = ICONS[item.icon] ?? Package;
              return (
                <li key={item.title} className="flex gap-4 py-5">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink-50">
                    <Icon className="size-7" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{index + 1}. {item.title}</h3>
                    <p className="mt-1 text-ink-500">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="bg-ink-50 p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold">Neden Bu Set?</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {set.reasons.map((reason) => {
              const Icon = ICONS[reason.icon] ?? Package;
              return (
                <div key={reason.text} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center font-semibold">
                  <Icon className="size-6" />
                  {reason.text}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/category-card";
import { Faq } from "@/components/faq";
import { HeroSlider } from "@/components/hero-slider";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { ReviewRail } from "@/components/review-rail";
import { accentGradient, categoryStyles } from "@/lib/palette";
import { activeCampaigns, priceProduct } from "@/lib/pricing";
import { ensureCampaignSetProducts } from "@/lib/sets";
import {
  getAllCategories,
  getCampaigns,
  getFaqs,
  getFeaturedReviews,
  getProducts,
  getSettings,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureCampaignSetProducts().catch(() => undefined);
  const [allCategories, settings, featured, newest, deals, reviews, faqs, campaigns] =
    await Promise.all([
      getAllCategories().catch(() => []),
      getSettings().catch(() => ({}) as Record<string, string>),
      getProducts({ featuredOnly: true, limit: 12 }).catch(() => []),
      getProducts({ sort: "newest", limit: 10 }).catch(() => []),
      getProducts({ sort: "popular", limit: 10 }).catch(() => []),
      getFeaturedReviews().catch(() => []),
      getFaqs().catch(() => []),
      getCampaigns(true).catch(() => []),
    ]);

  const styleFor = categoryStyles(allCategories);
  const liveCampaigns = activeCampaigns(campaigns);
  const homeCategories = allCategories.filter((item) => item.is_active === 1 && item.show_on_home === 1);
  const categories = homeCategories.length > 0 ? homeCategories : allCategories.filter((item) => !item.parent_id);

  return (
    <div className="space-y-16 pb-8 pt-8 sm:space-y-20">
      {settings.hero_enabled !== "0" && (
        <section className="container-page">
          <HeroSlider />
        </section>
      )}

      {settings.show_categories !== "0" && (
        <section className="container-page space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {settings.section_categories_title || "Kategoriler"}
            </h2>
            <p className="mt-2 text-sm text-ink-400">
              {settings.section_categories_subtitle || "İhtiyacın olan teknolojiyi kategorilerden keşfet."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      )}

      {settings.show_featured !== "0" && (
        <section className="container-page">
          <Rail
            title={settings.section_featured_title || "Sizin İçin Seçtiklerimiz"}
            action={
              <Link
                href="/arama"
                className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold transition hover:bg-ink-900 hover:text-white"
              >
                Tümünü görüntüle
              </Link>
            }
          >
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                {...styleFor(product.category_slug)}
                priced={priceProduct(product, liveCampaigns)}
              />
            ))}
          </Rail>
        </section>
      )}

      {categories.length > 0 && (
        <section className="container-page">
          <div className="grid gap-4 lg:grid-cols-2">
            {categories.slice(0, 2).map((category) => (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="group relative flex min-h-52 flex-col justify-center overflow-hidden rounded-3xl p-8"
                style={{ background: accentGradient(category.accent) }}
              >
                {category.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image_url}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-25 transition duration-500 group-hover:scale-105"
                  />
                )}
                <span className="relative text-xs font-bold uppercase tracking-widest text-ink-500">
                  Öne çıkan koleksiyon
                </span>
                <h3 className="relative mt-2 max-w-xs text-3xl font-extrabold tracking-tight">{category.name}</h3>
                <p className="relative mt-2 max-w-sm text-sm text-ink-600">{category.description}</p>
                <span className="relative mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition group-hover:gap-3">
                  Keşfet <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {settings.show_bestsellers !== "0" && (
        <section className="container-page">
          <Rail title={settings.section_bestsellers_title || "Çok Satanlar"}>
            {deals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                {...styleFor(product.category_slug)}
                priced={priceProduct(product, liveCampaigns)}
              />
            ))}
          </Rail>
        </section>
      )}

      {settings.show_stats !== "0" && (
        <section className="bg-ink-900 py-12 text-white">
          <div className="container-page grid gap-8 text-center sm:grid-cols-3">
            {[
              { value: settings.stat_customers, label: settings.stat_customers_label || "Mutlu müşteri" },
              { value: settings.stat_satisfaction, label: settings.stat_satisfaction_label || "Müşteri memnuniyeti" },
              { value: settings.stat_rating, label: settings.stat_rating_label || "Ürün değerlendirme puanı" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="overflow-hidden border-y border-ink-100 py-3">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-ink-200">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index}>{settings.site_name || "Tek Teknoloji"} · Garanti · Teknik servis</span>
          ))}
        </div>
      </div>

      {settings.show_new !== "0" && (
        <section className="container-page">
          <Rail title={settings.section_new_title || "Yeni Gelenler"}>
            {newest.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                {...styleFor(product.category_slug)}
                priced={priceProduct(product, liveCampaigns)}
              />
            ))}
          </Rail>
        </section>
      )}

      {settings.show_reviews !== "0" && (
        <section className="container-page">
          <ReviewRail reviews={reviews} title={settings.section_reviews_title} />
        </section>
      )}

      {settings.show_faq !== "0" && (
        <section className="container-page">
          <Faq faqs={faqs} title={settings.section_faq_title || undefined} />
        </section>
      )}
    </div>
  );
}

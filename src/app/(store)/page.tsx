import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Headset } from "lucide-react";

import { CategoryCard } from "@/components/category-card";
import { Faq } from "@/components/faq";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { ReviewRail } from "@/components/review-rail";
import { accentGradient, categoryStyles } from "@/lib/palette";
import { activeCampaigns, priceProduct } from "@/lib/pricing";
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
  const [allCategories, settings, featured, newest, deals, reviews, faqs, campaigns] =
    await Promise.all([
      getAllCategories(),
      getSettings(),
      getProducts({ featuredOnly: true, limit: 12 }),
      getProducts({ sort: "newest", limit: 10 }),
      getProducts({ sort: "popular", limit: 10 }),
      getFeaturedReviews(),
      getFaqs(),
      getCampaigns(true),
    ]);

  const styleFor = categoryStyles(allCategories);
  const liveCampaigns = activeCampaigns(campaigns);
  const homeCategories = allCategories.filter((item) => item.is_active === 1 && item.show_on_home === 1);
  const categories = homeCategories.length > 0 ? homeCategories : allCategories.filter((item) => !item.parent_id);

  return (
    <div className="space-y-16 pb-8 pt-8 sm:space-y-20">
      {settings.hero_enabled !== "0" && (
        <section className="container-page">
          <div className="relative overflow-hidden rounded-4xl bg-ink-900 px-6 py-14 text-white sm:px-12 sm:py-20">
            {settings.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.hero_image_url}
                alt=""
                className="absolute inset-0 size-full object-cover opacity-30"
              />
            ) : (
              <>
                <div
                  className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full opacity-25 blur-3xl"
                  style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
                />
                <div
                  className="pointer-events-none absolute -bottom-32 -left-20 size-[24rem] rounded-full opacity-20 blur-3xl"
                  style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
                />
              </>
            )}

            <div className="relative max-w-2xl animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="size-3.5" />
                {settings.hero_badge || settings.site_tagline}
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
                {settings.hero_title}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                {settings.hero_subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={settings.hero_cta_link || "/arama"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-brand-100"
                >
                  {settings.hero_cta_text || "Alışverişe başla"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/arama"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Tüm ürünler
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2"><Truck className="size-4" /> Ücretsiz kargo</span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4" /> 2 yıl garanti</span>
                <span className="inline-flex items-center gap-2"><Headset className="size-4" /> 7/24 destek</span>
              </div>
            </div>
          </div>
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

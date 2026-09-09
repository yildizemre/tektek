import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import {
  countProducts,
  getAllCategories,
  getCategoryBySlug,
  getProducts,
  type ProductFilter,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Kategori bulunamadı" };

  return {
    title: category.name,
    description: category.description || `${category.name} kategorisindeki tüm ürünler.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category || !category.is_active) notFound();

  const page = Math.max(1, Number(query.sayfa ?? 1) || 1);
  const sort = (typeof query.sirala === "string" ? query.sirala : undefined) as ProductFilter["sort"];

  const [allCategories, products, total] = await Promise.all([
    getAllCategories(),
    getProducts({ categorySlug: slug, sort, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countProducts({ categorySlug: slug }),
  ]);

  const parent = category.parent_id
    ? allCategories.find((item) => item.id === category.parent_id)
    : null;
  const siblings = allCategories.filter(
    (item) => item.parent_id === (category.parent_id ?? category.id) && item.id !== category.id,
  );
  const children = allCategories.filter((item) => item.parent_id === category.id);
  const chips = children.length > 0 ? children : siblings;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-page space-y-8 py-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <Link href="/" className="hover:text-ink-900">Anasayfa</Link>
        <span>/</span>
        {parent && (
          <>
            <Link href={`/kategori/${parent.slug}`} className="hover:text-ink-900">{parent.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-ink-900">{category.name}</span>
      </nav>

      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{category.name}</h1>
        {category.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-ink-500">{category.description}</p>
        )}
      </header>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parent && (
            <Link
              href={`/kategori/${parent.slug}`}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium transition hover:bg-ink-900 hover:text-white"
            >
              Tümü
            </Link>
          )}
          {chips.map((chip) => (
            <Link
              key={chip.id}
              href={`/kategori/${chip.slug}`}
              className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium transition hover:bg-ink-900 hover:text-white"
            >
              {chip.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-y border-ink-100 py-3">
        <span className="text-sm text-ink-400">{total} ürün</span>
        <SortSelect />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">
          Bu kategoride henüz ürün bulunmuyor.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} accent={category.accent} icon={category.icon} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, index) => {
            const target = index + 1;
            const search = new URLSearchParams();
            if (sort) search.set("sirala", sort);
            if (target > 1) search.set("sayfa", String(target));

            return (
              <Link
                key={target}
                href={`/kategori/${slug}${search.toString() ? `?${search}` : ""}`}
                className={`grid size-10 place-items-center rounded-full text-sm font-semibold transition ${
                  target === page ? "bg-ink-900 text-white" : "border border-ink-200 hover:bg-ink-50"
                }`}
              >
                {target}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

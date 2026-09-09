import { Search } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { SortSelect } from "@/components/sort-select";
import { categoryStyles } from "@/lib/palette";
import { countProducts, getAllCategories, getProducts, type ProductFilter } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Arama" };

const PAGE_SIZE = 24;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const sort = (typeof query.sirala === "string" ? query.sirala : undefined) as ProductFilter["sort"];

  const [categories, products, total] = await Promise.all([
    getAllCategories(),
    getProducts({ search: term || undefined, sort, limit: PAGE_SIZE }),
    countProducts({ search: term || undefined }),
  ]);

  const styleFor = categoryStyles(categories);

  return (
    <div className="container-page space-y-8 py-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {term ? `"${term}" için sonuçlar` : "Tüm ürünler"}
        </h1>
        <form action="/arama" className="flex max-w-lg items-center gap-2 rounded-full border border-ink-200 px-4 py-2.5">
          <Search className="size-4 text-ink-300" />
          <input
            name="q"
            defaultValue={term}
            placeholder="Ürün, kategori veya marka ara..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-300"
          />
          <button type="submit" className="rounded-full bg-ink-900 px-4 py-1.5 text-xs font-bold text-white">
            Ara
          </button>
        </form>
      </header>

      <div className="flex items-center justify-between gap-4 border-y border-ink-100 py-3">
        <span className="text-sm text-ink-400">{total} ürün bulundu</span>
        <SortSelect />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-400">
          Aramanızla eşleşen ürün bulunamadı. Farklı bir kelime deneyin.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} {...styleFor(product.category_slug)} />
          ))}
        </div>
      )}
    </div>
  );
}

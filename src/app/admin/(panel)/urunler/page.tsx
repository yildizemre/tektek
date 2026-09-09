import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";

import { deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Media } from "@/components/media";
import { formatPrice } from "@/lib/format";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ürünler" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q.trim() : "";
  const saved = query.durum === "kaydedildi";

  const products = await getProducts({
    search: term || undefined,
    includeInactive: true,
    limit: 200,
    sort: "newest",
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ürünler</h1>
          <p className="text-sm text-ink-400">{products.length} ürün listeleniyor.</p>
        </div>

        <Link
          href="/admin/urunler/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="size-4" />
          Yeni ürün
        </Link>
      </header>

      {saved && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Ürün kaydedildi.</p>
      )}

      <form action="/admin/urunler" className="flex max-w-md items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5">
        <Search className="size-4 text-ink-300" />
        <input
          name="q"
          defaultValue={term}
          placeholder="Ürün adı veya stok kodu ara..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
        <div className="divide-y divide-ink-50">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 px-4 py-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-xl">
                <Media src={product.image_url} alt={product.name} accent="slate" iconClassName="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="truncate text-xs text-ink-400">
                  {product.category_name ?? "Kategorisiz"} · {product.sku || "kodsuz"}
                </p>
              </div>

              <div className="hidden w-24 text-right sm:block">
                <p className="text-sm font-bold">{formatPrice(product.price)}</p>
                <p className="text-xs text-ink-400">{product.stock} adet</p>
              </div>

              <div className="hidden gap-1 md:flex">
                {product.is_featured === 1 && (
                  <span className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700">
                    Öne çıkan
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    product.is_active ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"
                  }`}
                >
                  {product.is_active ? "Yayında" : "Pasif"}
                </span>
              </div>

              <Link
                href={`/admin/urunler/${product.id}`}
                aria-label="Düzenle"
                className="rounded-full p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-900"
              >
                <Pencil className="size-4" />
              </Link>

              <DeleteButton
                id={product.id}
                action={deleteProductAction}
                confirmText={`"${product.name}" ürünü silinsin mi?`}
              />
            </div>
          ))}

          {products.length === 0 && (
            <p className="px-4 py-16 text-center text-sm text-ink-400">Ürün bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}

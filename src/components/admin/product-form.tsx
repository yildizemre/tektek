"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { saveProductAction, type FormState } from "@/app/admin/actions";
import { parseJsonArray } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveProductAction, {});

  return (
    <form action={formAction} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Temel bilgiler</h2>

            <label className="block space-y-1.5">
              <span className={LABEL}>Ürün adı *</span>
              <input name="name" required defaultValue={product?.name} className={FIELD} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className={LABEL}>URL (slug)</span>
                <input
                  name="slug"
                  defaultValue={product?.slug}
                  placeholder="boş bırakılırsa isimden üretilir"
                  className={FIELD}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={LABEL}>Stok kodu</span>
                <input name="sku" defaultValue={product?.sku} className={FIELD} />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className={LABEL}>Kısa açıklama</span>
              <textarea
                name="short_description"
                rows={2}
                defaultValue={product?.short_description}
                className={FIELD}
              />
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Detaylı açıklama</span>
              <textarea name="description" rows={6} defaultValue={product?.description} className={FIELD} />
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Özellikler (her satıra bir madde)</span>
              <textarea
                name="features"
                rows={5}
                defaultValue={parseJsonArray(product?.features).join("\n")}
                className={FIELD}
              />
            </label>
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Görseller</h2>
            <p className="text-xs text-ink-400">
              Görsel adresi girmezseniz kategori rengiyle otomatik bir kapak oluşturulur.
            </p>

            <label className="block space-y-1.5">
              <span className={LABEL}>Kapak görseli (URL)</span>
              <input name="image_url" defaultValue={product?.image_url} placeholder="https://..." className={FIELD} />
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Galeri (her satıra bir URL)</span>
              <textarea
                name="gallery"
                rows={4}
                defaultValue={parseJsonArray(product?.gallery).join("\n")}
                className={FIELD}
              />
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Fiyat ve stok</h2>

            <label className="block space-y-1.5">
              <span className={LABEL}>Satış fiyatı (TL) *</span>
              <input
                name="price"
                required
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.price}
                className={FIELD}
              />
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Üstü çizili fiyat (TL)</span>
              <input
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product?.compare_at_price ?? ""}
                className={FIELD}
              />
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Stok adedi</span>
              <input name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} className={FIELD} />
            </label>
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Yayın</h2>

            <label className="block space-y-1.5">
              <span className={LABEL}>Kategori</span>
              <select name="category_id" defaultValue={product?.category_id ?? ""} className={FIELD}>
                <option value="">Kategorisiz</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parent_id ? "— " : ""}
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className={LABEL}>Sıralama</span>
              <input name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} className={FIELD} />
            </label>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={product ? product.is_active === 1 : true}
                className="size-4 accent-indigo-600"
              />
              Yayında
            </label>

            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={product?.is_featured === 1}
                className="size-4 accent-indigo-600"
              />
              Anasayfada öne çıkar
            </label>
          </section>

          {state.error && (
            <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {state.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Kaydet
            </button>
            <Link
              href="/admin/urunler"
              className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold"
            >
              Vazgeç
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

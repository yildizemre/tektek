"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import { saveProductAction, type FormState } from "@/app/admin/actions";
import { GalleryUpload, ImageUpload } from "@/components/admin/image-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { parseJsonArray } from "@/lib/format";
import type { Category, Product, ProductTier, ProductVariant } from "@/lib/types";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

type VariantDraft = { name: string; hex: string; image: string; diff: string; stock: string };
type TierDraft = { qty: string; discount: string; badge: string };

export function ProductForm({
  product,
  categories,
  selectedCategoryIds = [],
  variants = [],
  tiers = [],
}: {
  product?: Product;
  categories: Category[];
  selectedCategoryIds?: number[];
  variants?: ProductVariant[];
  tiers?: ProductTier[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const [colorRows, setColorRows] = useState<VariantDraft[]>(
    variants.length
      ? variants.map((item) => ({
          name: item.name,
          hex: item.color_hex,
          image: item.image_url,
          diff: String(item.price_diff || ""),
          stock: String(item.stock || ""),
        }))
      : [],
  );
  const [tierRows, setTierRows] = useState<TierDraft[]>(
    tiers.length
      ? tiers.map((item) => ({
          qty: String(item.quantity),
          discount: String(item.discount_percent),
          badge: item.badge,
        }))
      : [{ qty: "2", discount: "10", badge: "En Avantajlı" }],
  );

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
                <span className={LABEL}>URL</span>
                <input name="slug" defaultValue={product?.slug} className={FIELD} />
              </label>
              <label className="block space-y-1.5">
                <span className={LABEL}>Stok kodu</span>
                <input name="sku" defaultValue={product?.sku} className={FIELD} />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className={LABEL}>Marka</span>
              <input name="brand" defaultValue={product?.brand} className={FIELD} />
            </label>
            <label className="block space-y-1.5">
              <span className={LABEL}>Kısa açıklama</span>
              <textarea name="short_description" rows={2} defaultValue={product?.short_description} className={FIELD} />
            </label>
            <RichEditor name="description" defaultValue={product?.description} label="Detaylı açıklama" />
            <label className="block space-y-1.5">
              <span className={LABEL}>Özellikler (her satıra bir madde)</span>
              <textarea name="features" rows={4} defaultValue={parseJsonArray(product?.features).join("\n")} className={FIELD} />
            </label>
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Görseller</h2>
            <ImageUpload name="image_url" defaultValue={product?.image_url} label="Kapak görseli" />
            <GalleryUpload name="gallery" defaultValue={parseJsonArray(product?.gallery)} label="Galeri" />
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Renk seçenekleri</h2>
              <button
                type="button"
                onClick={() => setColorRows((rows) => [...rows, { name: "", hex: "#f9a8d4", image: "", diff: "0", stock: "20" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Plus className="size-3.5" /> Renk ekle
              </button>
            </div>
            {colorRows.map((row, index) => (
              <div key={index} className="grid gap-2 rounded-2xl bg-ink-50 p-3 sm:grid-cols-[1fr_90px_1fr_80px_80px_auto]">
                <input name="variant_name" placeholder="Pembe" defaultValue={row.name} className={FIELD} />
                <input name="variant_hex" type="color" defaultValue={row.hex || "#f9a8d4"} className="h-11 w-full rounded-2xl border border-ink-200" />
                <input name="variant_image" placeholder="Görsel URL" defaultValue={row.image} className={FIELD} />
                <input name="variant_diff" placeholder="+TL" defaultValue={row.diff} className={FIELD} />
                <input name="variant_stock" placeholder="Stok" defaultValue={row.stock} className={FIELD} />
                <button type="button" onClick={() => setColorRows((rows) => rows.filter((_, i) => i !== index))} className="rounded-full p-2 text-ink-300 hover:text-red-500">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Daha fazla al, az öde</h2>
              <button
                type="button"
                onClick={() => setTierRows((rows) => [...rows, { qty: "3", discount: "15", badge: "Süper Fırsat" }])}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Plus className="size-3.5" /> Kademe ekle
              </button>
            </div>
            {tierRows.map((row, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[80px_80px_1fr_auto]">
                <input name="tier_qty" placeholder="Adet" defaultValue={row.qty} className={FIELD} />
                <input name="tier_discount" placeholder="%" defaultValue={row.discount} className={FIELD} />
                <input name="tier_badge" placeholder="Rozet" defaultValue={row.badge} className={FIELD} />
                <button type="button" onClick={() => setTierRows((rows) => rows.filter((_, i) => i !== index))} className="rounded-full p-2 text-ink-300 hover:text-red-500">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Fiyat ve stok</h2>
            <label className="block space-y-1.5">
              <span className={LABEL}>Satış fiyatı *</span>
              <input name="price" required type="number" step="0.01" defaultValue={product?.price} className={FIELD} />
            </label>
            <label className="block space-y-1.5">
              <span className={LABEL}>Üstü çizili fiyat</span>
              <input name="compare_at_price" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ""} className={FIELD} />
            </label>
            <label className="block space-y-1.5">
              <span className={LABEL}>Stok</span>
              <input name="stock" type="number" defaultValue={product?.stock ?? 0} className={FIELD} />
            </label>
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Kategoriler</h2>
            <label className="block space-y-1.5">
              <span className={LABEL}>Ana kategori</span>
              <select name="category_id" defaultValue={product?.category_id ?? ""} className={FIELD}>
                <option value="">Seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parent_id ? "— " : ""}{category.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="extra_category_ids"
                    value={category.id}
                    defaultChecked={selectedCategoryIds.includes(category.id)}
                  />
                  {category.parent_id ? "— " : ""}{category.name}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="is_active" defaultChecked={product ? product.is_active === 1 : true} />
              Yayında
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured === 1} />
              Anasayfada öne çıkar
            </label>
            <input name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} className={FIELD} />
          </section>

          <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">SEO</h2>
            <input name="seo_title" defaultValue={product?.seo_title} placeholder="SEO başlık" className={FIELD} />
            <textarea name="seo_description" rows={3} defaultValue={product?.seo_description} placeholder="SEO açıklama" className={FIELD} />
          </section>

          {state.error && (
            <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="size-4" /> {state.error}
            </p>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={pending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-bold text-white">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Kaydet
            </button>
            <Link href="/admin/urunler" className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold">Vazgeç</Link>
          </div>
        </div>
      </div>
    </form>
  );
}

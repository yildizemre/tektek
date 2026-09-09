"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { saveCategoryAction, type FormState } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { CategoryIcon, ICON_KEYS } from "@/components/category-icon";
import { ACCENT_KEYS, accentGradient } from "@/lib/palette";
import type { Category } from "@/lib/types";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

export function CategoryForm({
  category,
  categories,
}: {
  category?: Category;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveCategoryAction, {});
  const [accent, setAccent] = useState(category?.accent ?? "slate");
  const [icon, setIcon] = useState(category?.icon ?? "package");

  const parentOptions = categories.filter(
    (item) => item.parent_id === null && item.id !== category?.id,
  );

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      {category && <input type="hidden" name="id" value={category.id} />}

      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Kategori bilgileri</h2>

        <label className="block space-y-1.5">
          <span className={LABEL}>Kategori adı *</span>
          <input name="name" required defaultValue={category?.name} className={FIELD} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className={LABEL}>URL (slug)</span>
            <input
              name="slug"
              defaultValue={category?.slug}
              placeholder="boş bırakılırsa isimden üretilir"
              className={FIELD}
            />
          </label>

          <label className="block space-y-1.5">
            <span className={LABEL}>Üst kategori</span>
            <select name="parent_id" defaultValue={category?.parent_id ?? ""} className={FIELD}>
              <option value="">Ana kategori</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className={LABEL}>Açıklama</span>
          <textarea name="description" rows={3} defaultValue={category?.description} className={FIELD} />
        </label>

        <ImageUpload name="image_url" defaultValue={category?.image_url} label="Kategori görseli (anasayfa kartı)" />
        <input name="seo_title" defaultValue={category?.seo_title} placeholder="SEO başlık" className={FIELD} />
        <textarea name="seo_description" rows={2} defaultValue={category?.seo_description} placeholder="SEO açıklama" className={FIELD} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className={LABEL}>Sıralama</span>
            <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className={FIELD} />
          </label>

          <label className="flex items-end gap-3 pb-3 text-sm font-medium">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={category ? category.is_active === 1 : true}
              className="size-4 accent-indigo-600"
            />
            Yayında
          </label>
          <label className="flex items-end gap-3 pb-3 text-sm font-medium">
            <input
              type="checkbox"
              name="show_on_home"
              defaultChecked={category ? category.show_on_home === 1 : true}
              className="size-4 accent-indigo-600"
            />
            Anasayfada göster
          </label>
        </div>
      </section>

      <div className="space-y-6">
        <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">Görünüm</h2>

          <div
            className="flex aspect-[16/9] items-center justify-center rounded-2xl"
            style={{ background: accentGradient(accent) }}
          >
            <CategoryIcon name={icon} className="size-16 text-ink-700/40" />
          </div>

          <input type="hidden" name="accent" value={accent} />
          <div className="space-y-2">
            <span className={LABEL}>Renk</span>
            <div className="flex flex-wrap gap-2">
              {ACCENT_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAccent(key)}
                  aria-label={key}
                  className={`size-8 rounded-full border-2 transition ${
                    accent === key ? "border-ink-900" : "border-transparent"
                  }`}
                  style={{ background: accentGradient(key) }}
                />
              ))}
            </div>
          </div>

          <input type="hidden" name="icon" value={icon} />
          <div className="space-y-2">
            <span className={LABEL}>İkon</span>
            <div className="flex flex-wrap gap-2">
              {ICON_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-label={key}
                  className={`grid size-9 place-items-center rounded-xl border transition ${
                    icon === key ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 hover:bg-ink-50"
                  }`}
                >
                  <CategoryIcon name={key} className="size-4" />
                </button>
              ))}
            </div>
          </div>
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
            href="/admin/kategoriler"
            className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold"
          >
            Vazgeç
          </Link>
        </div>
      </div>
    </form>
  );
}

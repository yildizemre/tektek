import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { CategoryIcon } from "@/components/category-icon";
import { accentGradient } from "@/lib/palette";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kategoriler" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const categories = await getAllCategories();
  const parents = categories.filter((category) => category.parent_id === null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Kategoriler</h1>
          <p className="text-sm text-ink-400">{categories.length} kategori tanımlı.</p>
        </div>

        <Link
          href="/admin/kategoriler/yeni"
          className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="size-4" />
          Yeni kategori
        </Link>
      </header>

      {query.durum === "kaydedildi" && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Kategori kaydedildi.</p>
      )}

      <div className="space-y-3">
        {parents.map((parent) => {
          const children = categories.filter((item) => item.parent_id === parent.id);

          return (
            <div key={parent.id} className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
              <div className="flex items-center gap-4 px-4 py-3">
                <div
                  className="grid size-11 shrink-0 place-items-center rounded-xl"
                  style={{ background: accentGradient(parent.accent) }}
                >
                  <CategoryIcon name={parent.icon} className="size-5 text-ink-700/60" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{parent.name}</p>
                  <p className="truncate text-xs text-ink-400">/kategori/{parent.slug}</p>
                </div>

                {parent.is_active === 0 && (
                  <span className="rounded-full bg-ink-100 px-2 py-1 text-[11px] font-semibold text-ink-500">
                    Pasif
                  </span>
                )}

                <Link
                  href={`/admin/kategoriler/${parent.id}`}
                  aria-label="Düzenle"
                  className="rounded-full p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-900"
                >
                  <Pencil className="size-4" />
                </Link>

                <DeleteButton
                  id={parent.id}
                  action={deleteCategoryAction}
                  confirmText={`"${parent.name}" kategorisi silinsin mi? Ürünler kategorisiz kalacak.`}
                />
              </div>

              {children.length > 0 && (
                <div className="divide-y divide-ink-50 border-t border-ink-50 bg-ink-50/40">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center gap-4 py-2.5 pl-16 pr-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{child.name}</p>
                        <p className="truncate text-xs text-ink-400">/kategori/{child.slug}</p>
                      </div>

                      <Link
                        href={`/admin/kategoriler/${child.id}`}
                        aria-label="Düzenle"
                        className="rounded-full p-2 text-ink-400 hover:bg-white hover:text-ink-900"
                      >
                        <Pencil className="size-4" />
                      </Link>

                      <DeleteButton
                        id={child.id}
                        action={deleteCategoryAction}
                        confirmText={`"${child.name}" alt kategorisi silinsin mi?`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

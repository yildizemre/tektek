import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories, getProductById, getProductCategoryIds, getTiers, getVariants } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ürünü düzenle" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();

  const [categories, selectedCategoryIds, variants, tiers] = await Promise.all([
    getAllCategories(),
    getProductCategoryIds(product.id),
    getVariants(product.id),
    getTiers(product.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{product.name}</h1>
          <p className="text-xs text-ink-400">Eklendi: {product.created_at}</p>
        </div>
        <Link href={`/urun/${product.slug}`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold">
          <ExternalLink className="size-3.5" /> Mağazada gör
        </Link>
      </div>
      <ProductForm
        product={product}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        variants={variants}
        tiers={tiers}
      />
    </div>
  );
}

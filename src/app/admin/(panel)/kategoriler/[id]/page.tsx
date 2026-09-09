import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/category-form";
import { getAllCategories, getCategoryById } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kategoriyi düzenle" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(Number(id));
  if (!category) notFound();

  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{category.name}</h1>
      <CategoryForm category={category} categories={categories} />
    </div>
  );
}

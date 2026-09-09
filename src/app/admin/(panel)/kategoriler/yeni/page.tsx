import { CategoryForm } from "@/components/admin/category-form";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yeni kategori" };

export default async function NewCategoryPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Yeni kategori</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}

import { ProductForm } from "@/components/admin/product-form";
import { getAllCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yeni ürün" };

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Yeni ürün</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

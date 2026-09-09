import { CartPageContent } from "@/components/cart-page-content";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { categoryStyles } from "@/lib/palette";
import { getAllCategories, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sepetim" };

export default async function CartPage() {
  const [featured, categories] = await Promise.all([
    getProducts({ featuredOnly: true, limit: 10 }),
    getAllCategories(),
  ]);
  const styleFor = categoryStyles(categories);

  return (
    <>
      <CartPageContent />
      {featured.length > 0 && (
        <section className="container-page pb-16">
          <Rail title="Sizin İçin Seçtiklerimiz">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} {...styleFor(product.category_slug)} />
            ))}
          </Rail>
        </section>
      )}
    </>
  );
}

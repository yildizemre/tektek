import type { MetadataRoute } from "next";

import { getAllCategories, getPages, getProducts } from "@/lib/queries";
import { publicSiteUrl } from "@/lib/site";

function siteUrl() {
  return publicSiteUrl();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [categories, products, pages] = await Promise.all([
    getAllCategories(),
    getProducts({ limit: 500 }),
    getPages(),
  ]);

  const staticRoutes = ["", "/arama", "/sss", "/sepet", "/giris", "/kayit"].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  return [
    ...staticRoutes,
    ...categories
      .filter((category) => category.is_active === 1)
      .map((category) => ({
        url: `${base}/kategori/${category.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...products.map((product) => ({
      url: `${base}/urun/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages
      .filter((page) => page.is_active === 1)
      .map((page) => ({
        url: `${base}/sayfa/${page.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}

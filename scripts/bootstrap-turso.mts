import { db, all } from "../src/lib/db";

await db();
const products = await all<{ n: number }>("SELECT COUNT(*) AS n FROM products");
const categories = await all<{ n: number }>("SELECT COUNT(*) AS n FROM categories");
console.log(`Turso hazır. ${categories[0]?.n ?? 0} kategori, ${products[0]?.n ?? 0} ürün.`);

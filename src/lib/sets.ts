import { db } from "./db";
import { CAMPAIGN_SETS, setCover } from "./set-data";

export { CAMPAIGN_SETS, getCampaignSet } from "./set-data";

let ensured: Promise<void> | null = null;

/** Setleri sepete/ödemeye girebilmeleri için gerçek ürün olarak bir kez ekler (varsa dokunmaz). */
export function ensureCampaignSetProducts() {
  ensured ??= (async () => {
    const client = await db();
    const category = await client.execute({
      sql: "SELECT id FROM categories WHERE slug = ? LIMIT 1",
      args: ["kampanyali-setler"],
    });
    const categoryId = category.rows.length ? Number((category.rows[0] as unknown as { id: number }).id) : null;

    for (const [index, set] of CAMPAIGN_SETS.entries()) {
      const result = await client.execute({
        sql: `INSERT OR IGNORE INTO products
                (name, slug, sku, brand, short_description, description, price, compare_at_price, stock,
                 category_id, image_url, gallery, features, rating, review_count, is_active, is_featured, sort_order)
              VALUES (?, ?, ?, 'Tek Teknoloji', ?, ?, ?, ?, 100, ?, ?, ?, ?, 4.8, 0, 1, 1, ?)`,
        args: [
          set.name,
          set.slug,
          `TT-SET-${index + 1}`,
          set.subtitle,
          set.items.map((item) => `- **${item.title}:** ${item.text}`).join("\n"),
          set.price,
          set.compareAt,
          categoryId,
          setCover(set),
          JSON.stringify(set.gallery ?? []),
          JSON.stringify(set.items.map((item) => item.title)),
          -10 + index,
        ],
      });
      // İlk sürümde kapak olarak geniş banner yazılmıştı; panelden değiştirilmediyse kare kapağa geçir.
      await client.execute({
        sql: `UPDATE products SET image_url = ?, gallery = ?
              WHERE slug = ? AND (image_url = ? OR image_url = '' OR image_url IS NULL)`,
        args: [setCover(set), JSON.stringify(set.gallery ?? []), set.slug, set.banner],
      });
      if (result.rowsAffected && categoryId) {
        await client.execute({
          sql: "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)",
          args: [Number(result.lastInsertRowid), categoryId],
        });
      }
    }
  })().catch((error) => {
    ensured = null;
    throw error;
  });
  return ensured;
}

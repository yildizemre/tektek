import type { InValue } from "@libsql/client";
import { cache } from "react";

import { all, one, run } from "./db";
import { remember } from "./memo";
import type {
  AdminUser,
  Campaign,
  Category,
  CategoryTree,
  Coupon,
  Faq,
  MenuLink,
  Order,
  OrderItem,
  Page,
  Product,
  ProductTier,
  ProductVariant,
  Review,
  Slide,
  User,
} from "./types";

/* ---------------------------------------------------------------- settings */

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  return remember("settings", 20_000, async () => {
    const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  });
});

export async function updateSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await run(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value],
    );
  }
}

/* -------------------------------------------------------------- categories */

export const getCategoryTree = cache(async (): Promise<CategoryTree[]> => {
  return remember("category-tree", 20_000, async () => {
    const rows = await all<Category>(
      "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name",
    );

    return rows
      .filter((row) => row.parent_id === null)
      .map((parent) => ({ ...parent, children: rows.filter((row) => row.parent_id === parent.id) }));
  });
});

export async function getHomeCategories(): Promise<Category[]> {
  return all<Category>(
    "SELECT * FROM categories WHERE is_active = 1 AND show_on_home = 1 ORDER BY sort_order, name",
  );
}

export const getAllCategories = cache(async (): Promise<Category[]> => {
  return remember("categories-all", 20_000, () =>
    all<Category>(
      "SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id IS NOT NULL, sort_order, name",
    ),
  );
});

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return one<Category>("SELECT * FROM categories WHERE slug = ?", [slug]);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return one<Category>("SELECT * FROM categories WHERE id = ?", [id]);
}

async function categoryIdsFor(slug: string): Promise<number[]> {
  const category = await getCategoryBySlug(slug);
  if (!category) return [];

  const children = await all<{ id: number }>("SELECT id FROM categories WHERE parent_id = ?", [
    category.id,
  ]);

  return [category.id, ...children.map((child) => child.id)];
}

export async function saveCategory(input: {
  id?: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  accent: string;
  icon: string;
  parent_id: number | null;
  sort_order: number;
  is_active: number;
  show_on_home: number;
  seo_title: string;
  seo_description: string;
}) {
  if (input.id) {
    await run(
      `UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, accent = ?,
        icon = ?, parent_id = ?, sort_order = ?, is_active = ?, show_on_home = ?,
        seo_title = ?, seo_description = ? WHERE id = ?`,
      [
        input.name, input.slug, input.description, input.image_url, input.accent, input.icon,
        input.parent_id, input.sort_order, input.is_active, input.show_on_home,
        input.seo_title, input.seo_description, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO categories (name, slug, description, image_url, accent, icon, parent_id,
      sort_order, is_active, show_on_home, seo_title, seo_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name, input.slug, input.description, input.image_url, input.accent, input.icon,
      input.parent_id, input.sort_order, input.is_active, input.show_on_home,
      input.seo_title, input.seo_description,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteCategory(id: number) {
  await run("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);
  await run("DELETE FROM product_categories WHERE category_id = ?", [id]);
  await run("UPDATE categories SET parent_id = NULL WHERE parent_id = ?", [id]);
  await run("DELETE FROM categories WHERE id = ?", [id]);
}

/* ---------------------------------------------------------------- products */

export type ProductFilter = {
  categorySlug?: string;
  categoryId?: number;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
  includeInactive?: boolean;
  inStockOnly?: boolean;
};

const PRODUCT_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

async function buildProductWhere(filter: ProductFilter) {
  const clauses: string[] = [];
  const args: InValue[] = [];

  if (!filter.includeInactive) clauses.push("p.is_active = 1");
  if (filter.featuredOnly) clauses.push("p.is_featured = 1");
  if (filter.inStockOnly) clauses.push("p.stock > 0");

  const ids = filter.categorySlug
    ? await categoryIdsFor(filter.categorySlug)
    : filter.categoryId
      ? [filter.categoryId]
      : null;

  if (ids) {
    if (ids.length === 0) return { sql: "WHERE 1 = 0", args: [] as InValue[] };
    const placeholders = ids.map(() => "?").join(", ");
    clauses.push(
      `(p.category_id IN (${placeholders})
        OR EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id IN (${placeholders})))`,
    );
    args.push(...ids, ...ids);
  }

  if (filter.search) {
    clauses.push("(p.name LIKE ? OR p.short_description LIKE ? OR p.sku LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)");
    const like = `%${filter.search}%`;
    args.push(like, like, like, like, like);
  }

  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", args };
}

function orderClause(sort: ProductFilter["sort"]) {
  switch (sort) {
    case "price-asc":
      return "ORDER BY p.price ASC";
    case "price-desc":
      return "ORDER BY p.price DESC";
    case "popular":
      return "ORDER BY p.review_count DESC, p.rating DESC";
    case "newest":
      return "ORDER BY p.id DESC";
    default:
      return "ORDER BY p.sort_order ASC, p.id DESC";
  }
}

export async function getProducts(filter: ProductFilter = {}): Promise<Product[]> {
  return remember(`products:${JSON.stringify(filter)}`, 15_000, async () => {
    const where = await buildProductWhere(filter);
    return all<Product>(
      `${PRODUCT_SELECT} ${where.sql} ${orderClause(filter.sort)} LIMIT ? OFFSET ?`,
      [...where.args, filter.limit ?? 60, filter.offset ?? 0],
    );
  });
}

export async function countProducts(filter: ProductFilter = {}): Promise<number> {
  const where = await buildProductWhere(filter);
  const row = await one<{ c: number }>(`SELECT COUNT(*) AS c FROM products p ${where.sql}`, where.args);
  return Number(row?.c ?? 0);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return one<Product>(`${PRODUCT_SELECT} WHERE p.slug = ?`, [slug]);
}

export async function getProductById(id: number): Promise<Product | null> {
  return one<Product>(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
}

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.id IN (${ids.map(() => "?").join(", ")}) AND p.is_active = 1`,
    ids,
  );
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const related = await all<Product>(
    `${PRODUCT_SELECT}
     WHERE p.is_active = 1 AND p.id != ?
       AND (p.category_id IS ?
            OR EXISTS (SELECT 1 FROM product_categories pc
                       WHERE pc.product_id = p.id
                         AND pc.category_id IN (SELECT category_id FROM product_categories WHERE product_id = ?)))
     ORDER BY p.review_count DESC LIMIT ?`,
    [product.id, product.category_id, product.id, limit],
  );

  if (related.length > 0) return related;
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.is_active = 1 AND p.id != ? ORDER BY p.review_count DESC LIMIT ?`,
    [product.id, limit],
  );
}

export async function getProductCategoryIds(productId: number): Promise<number[]> {
  const rows = await all<{ category_id: number }>(
    "SELECT category_id FROM product_categories WHERE product_id = ?",
    [productId],
  );
  return rows.map((row) => Number(row.category_id));
}

export async function saveProduct(
  input: {
    id?: number;
    name: string;
    slug: string;
    sku: string;
    brand: string;
    short_description: string;
    description: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    category_id: number | null;
    image_url: string;
    gallery: string;
    features: string;
    is_active: number;
    is_featured: number;
    sort_order: number;
    seo_title: string;
    seo_description: string;
  },
  extraCategoryIds: number[] = [],
) {
  let productId = input.id ?? 0;

  if (input.id) {
    await run(
      `UPDATE products SET name = ?, slug = ?, sku = ?, brand = ?, short_description = ?, description = ?,
        price = ?, compare_at_price = ?, stock = ?, category_id = ?, image_url = ?, gallery = ?,
        features = ?, is_active = ?, is_featured = ?, sort_order = ?, seo_title = ?, seo_description = ?
       WHERE id = ?`,
      [
        input.name, input.slug, input.sku, input.brand, input.short_description, input.description,
        input.price, input.compare_at_price, input.stock, input.category_id, input.image_url,
        input.gallery, input.features, input.is_active, input.is_featured, input.sort_order,
        input.seo_title, input.seo_description, input.id,
      ],
    );
  } else {
    const result = await run(
      `INSERT INTO products (name, slug, sku, brand, short_description, description, price,
        compare_at_price, stock, category_id, image_url, gallery, features, is_active, is_featured,
        sort_order, seo_title, seo_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name, input.slug, input.sku, input.brand, input.short_description, input.description,
        input.price, input.compare_at_price, input.stock, input.category_id, input.image_url,
        input.gallery, input.features, input.is_active, input.is_featured, input.sort_order,
        input.seo_title, input.seo_description,
      ],
    );
    productId = Number(result.lastInsertRowid);
  }

  const categoryIds = new Set<number>(extraCategoryIds);
  if (input.category_id) categoryIds.add(input.category_id);

  await run("DELETE FROM product_categories WHERE product_id = ?", [productId]);
  for (const categoryId of categoryIds) {
    await run("INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)", [
      productId,
      categoryId,
    ]);
  }

  return productId;
}

export async function deleteProduct(id: number) {
  await run("DELETE FROM product_categories WHERE product_id = ?", [id]);
  await run("DELETE FROM product_variants WHERE product_id = ?", [id]);
  await run("DELETE FROM product_tiers WHERE product_id = ?", [id]);
  await run("DELETE FROM reviews WHERE product_id = ?", [id]);
  await run("DELETE FROM products WHERE id = ?", [id]);
}

/* -------------------------------------------------------- variants & tiers */

export async function getVariants(productId: number): Promise<ProductVariant[]> {
  return all<ProductVariant>(
    "SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order, id",
    [productId],
  );
}

export async function replaceVariants(
  productId: number,
  variants: Omit<ProductVariant, "id" | "product_id">[],
) {
  await run("DELETE FROM product_variants WHERE product_id = ?", [productId]);
  for (const [index, variant] of variants.entries()) {
    await run(
      `INSERT INTO product_variants (product_id, name, color_hex, image_url, price_diff, stock, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, variant.name, variant.color_hex, variant.image_url, variant.price_diff, variant.stock, index],
    );
  }
}

export async function getTiers(productId: number): Promise<ProductTier[]> {
  return all<ProductTier>(
    "SELECT * FROM product_tiers WHERE product_id = ? ORDER BY quantity",
    [productId],
  );
}

export async function replaceTiers(
  productId: number,
  tiers: Omit<ProductTier, "id" | "product_id">[],
) {
  await run("DELETE FROM product_tiers WHERE product_id = ?", [productId]);
  for (const [index, tier] of tiers.entries()) {
    await run(
      `INSERT INTO product_tiers (product_id, quantity, discount_percent, badge, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, tier.quantity, tier.discount_percent, tier.badge, index],
    );
  }
}

/* --------------------------------------------------- campaigns and coupons */

export async function getCampaigns(activeOnly = false): Promise<Campaign[]> {
  return remember(`campaigns:${activeOnly ? "on" : "all"}`, 20_000, async () => {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    return all<Campaign>(`SELECT * FROM campaigns ${where} ORDER BY id DESC`);
  });
}

export async function saveCampaign(input: Omit<Campaign, "id" | "created_at"> & { id?: number }) {
  if (input.id) {
    await run(
      `UPDATE campaigns SET name = ?, discount_percent = ?, scope = ?, target_id = ?, badge = ?,
        starts_at = ?, ends_at = ?, is_active = ? WHERE id = ?`,
      [
        input.name, input.discount_percent, input.scope, input.target_id, input.badge,
        input.starts_at, input.ends_at, input.is_active, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO campaigns (name, discount_percent, scope, target_id, badge, starts_at, ends_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name, input.discount_percent, input.scope, input.target_id, input.badge,
      input.starts_at, input.ends_at, input.is_active,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteCampaign(id: number) {
  await run("DELETE FROM campaigns WHERE id = ?", [id]);
}

export async function getCoupons(): Promise<Coupon[]> {
  return all<Coupon>("SELECT * FROM coupons ORDER BY id DESC");
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  return one<Coupon>("SELECT * FROM coupons WHERE UPPER(code) = ?", [code.trim().toUpperCase()]);
}

export async function saveCoupon(input: Omit<Coupon, "id" | "created_at" | "used_count"> & { id?: number }) {
  if (input.id) {
    await run(
      `UPDATE coupons SET code = ?, description = ?, type = ?, value = ?, min_total = ?,
        product_id = ?, category_id = ?, max_uses = ?, starts_at = ?, ends_at = ?, is_active = ?
       WHERE id = ?`,
      [
        input.code, input.description, input.type, input.value, input.min_total,
        input.product_id, input.category_id, input.max_uses, input.starts_at, input.ends_at,
        input.is_active, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO coupons (code, description, type, value, min_total, product_id, category_id,
      max_uses, starts_at, ends_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.code, input.description, input.type, input.value, input.min_total,
      input.product_id, input.category_id, input.max_uses, input.starts_at, input.ends_at,
      input.is_active,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteCoupon(id: number) {
  await run("DELETE FROM coupons WHERE id = ?", [id]);
}

export async function incrementCouponUsage(code: string) {
  await run("UPDATE coupons SET used_count = used_count + 1 WHERE UPPER(code) = ?", [
    code.trim().toUpperCase(),
  ]);
}

/* ----------------------------------------------------------------- reviews */

export async function getFeaturedReviews(limit = 12): Promise<Review[]> {
  return remember(`reviews-featured:${limit}`, 20_000, () =>
    all<Review>(
      `SELECT r.*, p.name AS product_name, p.slug AS product_slug
       FROM reviews r LEFT JOIN products p ON p.id = r.product_id
       WHERE r.is_featured = 1 AND r.is_approved = 1 ORDER BY r.id DESC LIMIT ?`,
      [limit],
    ),
  );
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  return all<Review>(
    "SELECT * FROM reviews WHERE product_id = ? AND is_approved = 1 ORDER BY id DESC",
    [productId],
  );
}

export async function listReviews(): Promise<Review[]> {
  return all<Review>(
    `SELECT r.*, p.name AS product_name, p.slug AS product_slug
     FROM reviews r LEFT JOIN products p ON p.id = r.product_id
     ORDER BY r.id DESC LIMIT 300`,
  );
}

export async function saveReview(input: {
  id?: number;
  product_id: number | null;
  user_id: number | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  image_url: string;
  is_approved: number;
  is_featured: number;
}) {
  if (input.id) {
    await run(
      `UPDATE reviews SET product_id = ?, author = ?, rating = ?, title = ?, body = ?,
        image_url = ?, is_approved = ?, is_featured = ? WHERE id = ?`,
      [
        input.product_id, input.author, input.rating, input.title, input.body,
        input.image_url, input.is_approved, input.is_featured, input.id,
      ],
    );
  } else {
    await run(
      `INSERT INTO reviews (product_id, user_id, author, rating, title, body, image_url, is_approved, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.product_id, input.user_id, input.author, input.rating, input.title,
        input.body, input.image_url, input.is_approved, input.is_featured,
      ],
    );
  }

  if (input.product_id) await refreshProductRating(input.product_id);
}

export async function deleteReview(id: number) {
  const review = await one<{ product_id: number | null }>(
    "SELECT product_id FROM reviews WHERE id = ?",
    [id],
  );
  await run("DELETE FROM reviews WHERE id = ?", [id]);
  if (review?.product_id) await refreshProductRating(review.product_id);
}

async function refreshProductRating(productId: number) {
  const row = await one<{ avg: number | null; total: number }>(
    "SELECT AVG(rating) AS avg, COUNT(*) AS total FROM reviews WHERE product_id = ? AND is_approved = 1",
    [productId],
  );

  if (!row || !row.total) return;
  await run("UPDATE products SET rating = ? WHERE id = ?", [
    Math.round((Number(row.avg) || 4.8) * 10) / 10,
    productId,
  ]);
}

/* ------------------------------------------------------------------- users */

export async function getUserByEmail(email: string): Promise<User | null> {
  return one<User>("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()]);
}

export async function getUserById(id: number): Promise<User | null> {
  return one<User>("SELECT * FROM users WHERE id = ?", [id]);
}

export async function createUser(input: {
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
}): Promise<number> {
  const result = await run(
    "INSERT INTO users (email, name, phone, password_hash) VALUES (?, ?, ?, ?)",
    [input.email.trim().toLowerCase(), input.name, input.phone, input.passwordHash],
  );
  return Number(result.lastInsertRowid);
}

export async function updateUserProfile(
  id: number,
  input: { name: string; phone: string; address: string; city: string; district: string },
) {
  await run(
    "UPDATE users SET name = ?, phone = ?, address = ?, city = ?, district = ? WHERE id = ?",
    [input.name, input.phone, input.address, input.city, input.district, id],
  );
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await run("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, id]);
}

export async function listUsers(search?: string): Promise<(User & { order_count: number; total_spent: number })[]> {
  const where = search ? "WHERE u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?" : "";
  const args: InValue[] = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];

  return all(
    `SELECT u.*,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
       (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id AND o.payment_status = 'paid') AS total_spent
     FROM users u ${where} ORDER BY u.id DESC LIMIT 300`,
    args,
  );
}

export async function setUserActive(id: number, isActive: number) {
  await run("UPDATE users SET is_active = ? WHERE id = ?", [isActive, id]);
}

export async function deleteUser(id: number) {
  await run("UPDATE orders SET user_id = NULL WHERE user_id = ?", [id]);
  await run("DELETE FROM users WHERE id = ?", [id]);
}

/* ------------------------------------------------------------ admin users */

export async function listAdmins(): Promise<AdminUser[]> {
  return all<AdminUser>("SELECT * FROM admin_users ORDER BY id");
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  return one<AdminUser>("SELECT * FROM admin_users WHERE email = ?", [email.trim().toLowerCase()]);
}

export async function createAdmin(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}) {
  await run("INSERT INTO admin_users (email, name, password_hash, role) VALUES (?, ?, ?, ?)", [
    input.email.trim().toLowerCase(),
    input.name,
    input.passwordHash,
    input.role,
  ]);
}

export async function deleteAdmin(id: number) {
  await run("DELETE FROM admin_users WHERE id = ?", [id]);
}

/* ------------------------------------------------------------------ orders */

export function generateOrderCode(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TT${Date.now().toString(36).toUpperCase().slice(-6)}${random}`;
}

export async function createOrder(
  input: Omit<
    Order,
    | "id" | "created_at" | "status" | "payment_status" | "payment_ref"
    | "payment_error" | "tracking_number" | "carrier" | "admin_note"
  >,
  items: Omit<OrderItem, "id" | "order_id">[],
): Promise<Order> {
  const result = await run(
    `INSERT INTO orders (code, user_id, conversation_id, customer_name, email, phone, identity_number,
      address, city, district, zip_code, note, coupon_code, discount_total, subtotal, shipping_cost,
      total, payment_method)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.code, input.user_id, input.conversation_id, input.customer_name, input.email,
      input.phone, input.identity_number, input.address, input.city, input.district,
      input.zip_code, input.note, input.coupon_code, input.discount_total, input.subtotal,
      input.shipping_cost, input.total, input.payment_method,
    ],
  );

  const orderId = Number(result.lastInsertRowid);

  for (const item of items) {
    await run(
      `INSERT INTO order_items (order_id, product_id, variant_name, name, image_url, price, list_price, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, item.product_id, item.variant_name, item.name, item.image_url,
        item.price, item.list_price, item.quantity,
      ],
    );
  }

  return (await one<Order>("SELECT * FROM orders WHERE id = ?", [orderId]))!;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  return one<Order>("SELECT * FROM orders WHERE code = ?", [code]);
}

export async function getOrderById(id: number): Promise<Order | null> {
  return one<Order>("SELECT * FROM orders WHERE id = ?", [id]);
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  return all<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [orderId]);
}

export async function getOrdersForUser(userId: number): Promise<Order[]> {
  return all<Order>("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [userId]);
}

export async function listOrders(filter: { status?: string; search?: string } = {}): Promise<Order[]> {
  const clauses: string[] = [];
  const args: InValue[] = [];

  if (filter.status) {
    clauses.push("status = ?");
    args.push(filter.status);
  }

  if (filter.search) {
    clauses.push("(code LIKE ? OR customer_name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${filter.search}%`;
    args.push(like, like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return all<Order>(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT 300`, args);
}

export async function markOrderPaid(orderId: number, paymentRef: string) {
  await run(
    "UPDATE orders SET payment_status = 'paid', status = 'paid', payment_ref = ?, payment_error = '' WHERE id = ?",
    [paymentRef, orderId],
  );

  const order = await getOrderById(orderId);
  if (order?.coupon_code) await incrementCouponUsage(order.coupon_code);

  for (const item of await getOrderItems(orderId)) {
    if (item.product_id) {
      await run("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }
  }
}

export async function markOrderFailed(orderId: number, message: string) {
  await run("UPDATE orders SET payment_status = 'failed', payment_error = ? WHERE id = ?", [
    message.slice(0, 400),
    orderId,
  ]);
}

export async function updateOrderAdminFields(
  orderId: number,
  input: {
    status: string;
    payment_status: string;
    tracking_number: string;
    carrier: string;
    admin_note: string;
  },
) {
  await run(
    `UPDATE orders SET status = ?, payment_status = ?, tracking_number = ?, carrier = ?, admin_note = ?
     WHERE id = ?`,
    [
      input.status, input.payment_status, input.tracking_number, input.carrier,
      input.admin_note, orderId,
    ],
  );
}

export async function updateOrderStatus(orderId: number, status: string) {
  await run("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
}

export async function deleteOrder(orderId: number) {
  await run("DELETE FROM order_items WHERE order_id = ?", [orderId]);
  await run("DELETE FROM orders WHERE id = ?", [orderId]);
}

/* ------------------------------------------------------ content management */

export async function getSlides(position: string, activeOnly = true): Promise<Slide[]> {
  return remember(`slides:${position}:${activeOnly ? 1 : 0}`, 20_000, async () => {
    const where = activeOnly ? "AND is_active = 1" : "";
    return all<Slide>(
      `SELECT * FROM slides WHERE position = ? ${where} ORDER BY sort_order, id`,
      [position],
    );
  });
}

export async function listSlides(): Promise<Slide[]> {
  return all<Slide>("SELECT * FROM slides ORDER BY position, sort_order, id");
}

export async function saveSlide(input: Omit<Slide, "id"> & { id?: number }) {
  if (input.id) {
    await run(
      `UPDATE slides SET position = ?, title = ?, subtitle = ?, image_url = ?, link = ?,
        sort_order = ?, is_active = ? WHERE id = ?`,
      [
        input.position, input.title, input.subtitle, input.image_url, input.link,
        input.sort_order, input.is_active, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO slides (position, title, subtitle, image_url, link, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.position, input.title, input.subtitle, input.image_url, input.link,
      input.sort_order, input.is_active,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteSlide(id: number) {
  await run("DELETE FROM slides WHERE id = ?", [id]);
}

export async function getMenuLinks(activeOnly = true): Promise<MenuLink[]> {
  return remember(`menu:${activeOnly ? 1 : 0}`, 20_000, async () => {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    return all<MenuLink>(`SELECT * FROM menu_links ${where} ORDER BY section, sort_order, id`);
  });
}

export async function saveMenuLink(input: Omit<MenuLink, "id"> & { id?: number }) {
  if (input.id) {
    await run(
      "UPDATE menu_links SET section = ?, label = ?, href = ?, sort_order = ?, is_active = ? WHERE id = ?",
      [input.section, input.label, input.href, input.sort_order, input.is_active, input.id],
    );
    return input.id;
  }

  const result = await run(
    "INSERT INTO menu_links (section, label, href, sort_order, is_active) VALUES (?, ?, ?, ?, ?)",
    [input.section, input.label, input.href, input.sort_order, input.is_active],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteMenuLink(id: number) {
  await run("DELETE FROM menu_links WHERE id = ?", [id]);
}

export async function getPages(activeOnly = true): Promise<Page[]> {
  const where = activeOnly ? "WHERE is_active = 1" : "";
  return all<Page>(`SELECT * FROM pages ${where} ORDER BY sort_order, id`);
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return one<Page>("SELECT * FROM pages WHERE slug = ?", [slug]);
}

export async function getPageById(id: number): Promise<Page | null> {
  return one<Page>("SELECT * FROM pages WHERE id = ?", [id]);
}

export async function savePage(input: Omit<Page, "id" | "updated_at"> & { id?: number }) {
  if (input.id) {
    await run(
      `UPDATE pages SET slug = ?, title = ?, body = ?, seo_title = ?, seo_description = ?,
        is_active = ?, sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
      [
        input.slug, input.title, input.body, input.seo_title, input.seo_description,
        input.is_active, input.sort_order, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO pages (slug, title, body, seo_title, seo_description, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.slug, input.title, input.body, input.seo_title, input.seo_description,
      input.is_active, input.sort_order,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deletePage(id: number) {
  await run("DELETE FROM pages WHERE id = ?", [id]);
}

export async function getFaqs(activeOnly = true): Promise<Faq[]> {
  return remember(`faqs:${activeOnly ? 1 : 0}`, 20_000, async () => {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    return all<Faq>(`SELECT * FROM faqs ${where} ORDER BY sort_order, id`);
  });
}

export async function saveFaq(input: Omit<Faq, "id"> & { id?: number }) {
  if (input.id) {
    await run(
      "UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?",
      [input.question, input.answer, input.sort_order, input.is_active, input.id],
    );
    return input.id;
  }

  const result = await run(
    "INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, ?)",
    [input.question, input.answer, input.sort_order, input.is_active],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteFaq(id: number) {
  await run("DELETE FROM faqs WHERE id = ?", [id]);
}

/* --------------------------------------------------------------- analytics */

export async function recordVisit(path: string, visitor: string) {
  const day = new Date().toISOString().slice(0, 10);
  await run("INSERT INTO visits (day, path, visitor) VALUES (?, ?, ?)", [
    day,
    path.slice(0, 200),
    visitor.slice(0, 64),
  ]);
}

export type AnalyticsSummary = {
  visitorsToday: number;
  viewsToday: number;
  visitors7: number;
  views7: number;
  visitors30: number;
  orders30: number;
  revenue30: number;
  revenueTotal: number;
  ordersTotal: number;
  paidOrders: number;
  pendingOrders: number;
  products: number;
  customers: number;
  conversion: number;
  daily: { day: string; views: number; visitors: number; orders: number; revenue: number }[];
  topPages: { path: string; views: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
};

function dayOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const today = new Date().toISOString().slice(0, 10);
  const since7 = dayOffset(6);
  const since30 = dayOffset(29);

  const [
    todayRow, week, month, revenue, counts, dailyViews, dailyOrders, topPages, topProducts,
  ] = await Promise.all([
    one<{ views: number; visitors: number }>(
      "SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM visits WHERE day = ?",
      [today],
    ),
    one<{ views: number; visitors: number }>(
      "SELECT COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM visits WHERE day >= ?",
      [since7],
    ),
    one<{ visitors: number }>(
      "SELECT COUNT(DISTINCT visitor) AS visitors FROM visits WHERE day >= ?",
      [since30],
    ),
    one<{ total: number; orders: number }>(
      `SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS orders FROM orders
       WHERE payment_status = 'paid' AND date(created_at) >= ?`,
      [since30],
    ),
    one<{ products: number; customers: number; ordersTotal: number; paid: number; pending: number; revenue: number }>(
      `SELECT
        (SELECT COUNT(*) FROM products) AS products,
        (SELECT COUNT(*) FROM users) AS customers,
        (SELECT COUNT(*) FROM orders) AS ordersTotal,
        (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid') AS paid,
        (SELECT COUNT(*) FROM orders WHERE payment_status = 'pending') AS pending,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid') AS revenue`,
    ),
    all<{ day: string; views: number; visitors: number }>(
      `SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
       FROM visits WHERE day >= ? GROUP BY day ORDER BY day`,
      [since30],
    ),
    all<{ day: string; orders: number; revenue: number }>(
      `SELECT date(created_at) AS day, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders WHERE date(created_at) >= ? GROUP BY day ORDER BY day`,
      [since30],
    ),
    all<{ path: string; views: number }>(
      `SELECT path, COUNT(*) AS views FROM visits WHERE day >= ?
       GROUP BY path ORDER BY views DESC LIMIT 8`,
      [since30],
    ),
    all<{ name: string; quantity: number; revenue: number }>(
      `SELECT oi.name AS name, SUM(oi.quantity) AS quantity, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.name ORDER BY quantity DESC LIMIT 8`,
    ),
  ]);

  const viewsByDay = new Map(dailyViews.map((row) => [row.day, row]));
  const ordersByDay = new Map(dailyOrders.map((row) => [row.day, row]));

  const daily = Array.from({ length: 30 }).map((_, index) => {
    const day = dayOffset(29 - index);
    return {
      day,
      views: Number(viewsByDay.get(day)?.views ?? 0),
      visitors: Number(viewsByDay.get(day)?.visitors ?? 0),
      orders: Number(ordersByDay.get(day)?.orders ?? 0),
      revenue: Number(ordersByDay.get(day)?.revenue ?? 0),
    };
  });

  const visitors30 = Number(month?.visitors ?? 0);
  const orders30 = Number(revenue?.orders ?? 0);

  return {
    visitorsToday: Number(todayRow?.visitors ?? 0),
    viewsToday: Number(todayRow?.views ?? 0),
    visitors7: Number(week?.visitors ?? 0),
    views7: Number(week?.views ?? 0),
    visitors30,
    orders30,
    revenue30: Number(revenue?.total ?? 0),
    revenueTotal: Number(counts?.revenue ?? 0),
    ordersTotal: Number(counts?.ordersTotal ?? 0),
    paidOrders: Number(counts?.paid ?? 0),
    pendingOrders: Number(counts?.pending ?? 0),
    products: Number(counts?.products ?? 0),
    customers: Number(counts?.customers ?? 0),
    conversion: visitors30 > 0 ? Math.round((orders30 / visitors30) * 1000) / 10 : 0,
    daily,
    topPages,
    topProducts,
  };
}

export async function getRecentOrders(limit = 8): Promise<Order[]> {
  return all<Order>("SELECT * FROM orders ORDER BY id DESC LIMIT ?", [limit]);
}

export async function getLowStockProducts(limit = 6): Promise<Product[]> {
  return all<Product>("SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT ?", [limit]);
}

/* ------------------------------------------------------------- subscribers */

export async function addSubscriber(email: string) {
  await run("INSERT INTO subscribers (email) VALUES (?) ON CONFLICT(email) DO NOTHING", [
    email.toLowerCase(),
  ]);
}

export async function listSubscribers() {
  return all<{ id: number; email: string; created_at: string }>(
    "SELECT * FROM subscribers ORDER BY id DESC LIMIT 500",
  );
}

/* ------------------------------------------------------------------- media */

export async function saveMedia(input: { name: string; mime: string; data: string; size: number }) {
  const result = await run(
    "INSERT INTO media (name, mime, data, size) VALUES (?, ?, ?, ?)",
    [input.name, input.mime, input.data, input.size],
  );
  return Number(result.lastInsertRowid);
}

export async function getMedia(id: number) {
  return one<{ id: number; mime: string; data: string }>(
    "SELECT id, mime, data FROM media WHERE id = ?",
    [id],
  );
}

export async function listMedia(limit = 60) {
  return all<{ id: number; name: string; size: number; created_at: string }>(
    "SELECT id, name, size, created_at FROM media ORDER BY id DESC LIMIT ?",
    [limit],
  );
}

export async function deleteMedia(id: number) {
  await run("DELETE FROM media WHERE id = ?", [id]);
}

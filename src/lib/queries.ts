import type { InValue } from "@libsql/client";

import { all, one, run } from "./db";
import type {
  Category,
  CategoryTree,
  Order,
  OrderItem,
  Product,
  Review,
} from "./types";

/* ---------------------------------------------------------------- settings */

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function updateSettings(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    await run(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [key, value],
    );
  }
}

/* -------------------------------------------------------------- categories */

export async function getCategoryTree(): Promise<CategoryTree[]> {
  const rows = await all<Category>(
    "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, name",
  );

  const parents = rows.filter((row) => row.parent_id === null);
  return parents.map((parent) => ({
    ...parent,
    children: rows.filter((row) => row.parent_id === parent.id),
  }));
}

export async function getAllCategories(): Promise<Category[]> {
  return all<Category>("SELECT * FROM categories ORDER BY COALESCE(parent_id, id), parent_id, sort_order, name");
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return one<Category>("SELECT * FROM categories WHERE slug = ?", [slug]);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return one<Category>("SELECT * FROM categories WHERE id = ?", [id]);
}

/** A parent category page should also list everything under its sub-categories. */
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
}) {
  if (input.id) {
    await run(
      `UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, accent = ?,
        icon = ?, parent_id = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [
        input.name, input.slug, input.description, input.image_url, input.accent,
        input.icon, input.parent_id, input.sort_order, input.is_active, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO categories (name, slug, description, image_url, accent, icon, parent_id, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name, input.slug, input.description, input.image_url, input.accent,
      input.icon, input.parent_id, input.sort_order, input.is_active,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteCategory(id: number) {
  await run("UPDATE products SET category_id = NULL WHERE category_id = ?", [id]);
  await run("UPDATE categories SET parent_id = NULL WHERE parent_id = ?", [id]);
  await run("DELETE FROM categories WHERE id = ?", [id]);
}

/* ---------------------------------------------------------------- products */

export type ProductFilter = {
  categorySlug?: string;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
  includeInactive?: boolean;
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

  if (filter.categorySlug) {
    const ids = await categoryIdsFor(filter.categorySlug);
    if (ids.length === 0) return { sql: "WHERE 1 = 0", args: [] as InValue[] };
    clauses.push(`p.category_id IN (${ids.map(() => "?").join(", ")})`);
    args.push(...ids);
  }

  if (filter.search) {
    clauses.push("(p.name LIKE ? OR p.short_description LIKE ? OR p.sku LIKE ?)");
    const like = `%${filter.search}%`;
    args.push(like, like, like);
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
  const where = await buildProductWhere(filter);
  const limit = filter.limit ?? 60;
  const offset = filter.offset ?? 0;

  return all<Product>(
    `${PRODUCT_SELECT} ${where.sql} ${orderClause(filter.sort)} LIMIT ? OFFSET ?`,
    [...where.args, limit, offset],
  );
}

export async function countProducts(filter: ProductFilter = {}): Promise<number> {
  const where = await buildProductWhere(filter);
  const row = await one<{ c: number }>(
    `SELECT COUNT(*) AS c FROM products p ${where.sql}`,
    where.args,
  );
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

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return all<Product>(
    `${PRODUCT_SELECT} WHERE p.is_active = 1 AND p.id != ? AND p.category_id IS ?
     ORDER BY p.review_count DESC LIMIT ?`,
    [product.id, product.category_id, limit],
  );
}

export async function saveProduct(input: {
  id?: number;
  name: string;
  slug: string;
  sku: string;
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
}) {
  if (input.id) {
    await run(
      `UPDATE products SET name = ?, slug = ?, sku = ?, short_description = ?, description = ?,
        price = ?, compare_at_price = ?, stock = ?, category_id = ?, image_url = ?, gallery = ?,
        features = ?, is_active = ?, is_featured = ?, sort_order = ? WHERE id = ?`,
      [
        input.name, input.slug, input.sku, input.short_description, input.description,
        input.price, input.compare_at_price, input.stock, input.category_id, input.image_url,
        input.gallery, input.features, input.is_active, input.is_featured, input.sort_order, input.id,
      ],
    );
    return input.id;
  }

  const result = await run(
    `INSERT INTO products (name, slug, sku, short_description, description, price, compare_at_price,
      stock, category_id, image_url, gallery, features, is_active, is_featured, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name, input.slug, input.sku, input.short_description, input.description,
      input.price, input.compare_at_price, input.stock, input.category_id, input.image_url,
      input.gallery, input.features, input.is_active, input.is_featured, input.sort_order,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteProduct(id: number) {
  await run("DELETE FROM products WHERE id = ?", [id]);
}

/* ----------------------------------------------------------------- reviews */

export async function getFeaturedReviews(limit = 12): Promise<Review[]> {
  return all<Review>(
    "SELECT * FROM reviews WHERE is_featured = 1 ORDER BY id DESC LIMIT ?",
    [limit],
  );
}

export async function getProductReviews(productId: number): Promise<Review[]> {
  return all<Review>("SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC", [productId]);
}

/* ------------------------------------------------------------------ orders */

export function generateOrderCode(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EN${Date.now().toString(36).toUpperCase().slice(-6)}${random}`;
}

export async function createOrder(
  input: Omit<Order, "id" | "created_at" | "status" | "payment_status" | "payment_ref" | "payment_error">,
  items: Omit<OrderItem, "id" | "order_id">[],
): Promise<Order> {
  const result = await run(
    `INSERT INTO orders (code, conversation_id, customer_name, email, phone, identity_number,
      address, city, district, zip_code, note, subtotal, shipping_cost, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.code, input.conversation_id, input.customer_name, input.email, input.phone,
      input.identity_number, input.address, input.city, input.district, input.zip_code,
      input.note, input.subtotal, input.shipping_cost, input.total,
    ],
  );

  const orderId = Number(result.lastInsertRowid);

  for (const item of items) {
    await run(
      `INSERT INTO order_items (order_id, product_id, name, image_url, price, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, item.product_id, item.name, item.image_url, item.price, item.quantity],
    );
  }

  const order = await one<Order>("SELECT * FROM orders WHERE id = ?", [orderId]);
  return order!;
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  return one<Order>("SELECT * FROM orders WHERE code = ?", [code]);
}

export async function getOrderByConversationId(conversationId: string): Promise<Order | null> {
  return one<Order>("SELECT * FROM orders WHERE conversation_id = ?", [conversationId]);
}

export async function getOrderById(id: number): Promise<Order | null> {
  return one<Order>("SELECT * FROM orders WHERE id = ?", [id]);
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  return all<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [orderId]);
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
  return all<Order>(`SELECT * FROM orders ${where} ORDER BY id DESC LIMIT 200`, args);
}

export async function markOrderPaid(orderId: number, paymentRef: string) {
  await run(
    "UPDATE orders SET payment_status = 'paid', status = 'paid', payment_ref = ?, payment_error = '' WHERE id = ?",
    [paymentRef, orderId],
  );

  const items = await getOrderItems(orderId);
  for (const item of items) {
    if (item.product_id) {
      await run("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }
  }
}

export async function markOrderFailed(orderId: number, message: string) {
  await run(
    "UPDATE orders SET payment_status = 'failed', payment_error = ? WHERE id = ?",
    [message.slice(0, 400), orderId],
  );
}

export async function updateOrderStatus(orderId: number, status: string) {
  await run("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
}

export async function deleteOrder(orderId: number) {
  await run("DELETE FROM order_items WHERE order_id = ?", [orderId]);
  await run("DELETE FROM orders WHERE id = ?", [orderId]);
}

/* --------------------------------------------------------------- dashboard */

export async function getDashboardStats() {
  const [products, categories, orders, paidOrders, revenue, lowStock] = await Promise.all([
    one<{ c: number }>("SELECT COUNT(*) AS c FROM products"),
    one<{ c: number }>("SELECT COUNT(*) AS c FROM categories"),
    one<{ c: number }>("SELECT COUNT(*) AS c FROM orders"),
    one<{ c: number }>("SELECT COUNT(*) AS c FROM orders WHERE payment_status = 'paid'"),
    one<{ s: number }>("SELECT COALESCE(SUM(total), 0) AS s FROM orders WHERE payment_status = 'paid'"),
    all<Product>("SELECT * FROM products WHERE stock <= 5 ORDER BY stock ASC LIMIT 5"),
  ]);

  return {
    products: Number(products?.c ?? 0),
    categories: Number(categories?.c ?? 0),
    orders: Number(orders?.c ?? 0),
    paidOrders: Number(paidOrders?.c ?? 0),
    revenue: Number(revenue?.s ?? 0),
    lowStock,
  };
}

export async function getRecentOrders(limit = 8): Promise<Order[]> {
  return all<Order>("SELECT * FROM orders ORDER BY id DESC LIMIT ?", [limit]);
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

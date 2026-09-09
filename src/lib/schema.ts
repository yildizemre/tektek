export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    accent TEXT DEFAULT 'slate',
    icon TEXT DEFAULT 'package',
    parent_id INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    show_on_home INTEGER NOT NULL DEFAULT 1,
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    short_description TEXT DEFAULT '',
    description TEXT DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    compare_at_price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER,
    image_url TEXT DEFAULT '',
    gallery TEXT DEFAULT '[]',
    features TEXT DEFAULT '[]',
    rating REAL NOT NULL DEFAULT 4.8,
    review_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (product_id, category_id)
  )`,

  `CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color_hex TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    price_diff REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS product_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    discount_percent REAL NOT NULL DEFAULT 0,
    badge TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    district TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    conversation_id TEXT DEFAULT '',
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    identity_number TEXT DEFAULT '',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT DEFAULT '',
    zip_code TEXT DEFAULT '',
    note TEXT DEFAULT '',
    coupon_code TEXT DEFAULT '',
    discount_total REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    shipping_cost REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT DEFAULT 'iyzico',
    payment_ref TEXT DEFAULT '',
    payment_error TEXT DEFAULT '',
    tracking_number TEXT DEFAULT '',
    carrier TEXT DEFAULT '',
    admin_note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    variant_name TEXT DEFAULT '',
    name TEXT NOT NULL,
    image_url TEXT DEFAULT '',
    price REAL NOT NULL,
    list_price REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    user_id INTEGER,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    title TEXT DEFAULT '',
    body TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    is_approved INTEGER NOT NULL DEFAULT 1,
    is_featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'percent',
    value REAL NOT NULL DEFAULT 0,
    min_total REAL NOT NULL DEFAULT 0,
    product_id INTEGER,
    category_id INTEGER,
    max_uses INTEGER NOT NULL DEFAULT 0,
    used_count INTEGER NOT NULL DEFAULT 0,
    starts_at TEXT DEFAULT '',
    ends_at TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    discount_percent REAL NOT NULL DEFAULT 0,
    scope TEXT NOT NULL DEFAULT 'all',
    target_id INTEGER,
    badge TEXT DEFAULT '',
    starts_at TEXT DEFAULT '',
    ends_at TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    mime TEXT NOT NULL DEFAULT 'image/jpeg',
    size INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position TEXT NOT NULL DEFAULT 'footer',
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    link TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS menu_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL DEFAULT 'footer1',
    label TEXT NOT NULL,
    href TEXT NOT NULL DEFAULT '/',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '/',
    visitor TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT 'Yönetici',
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'owner',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
];

export const INDEX_STATEMENTS: string[] = [
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tiers_product ON product_tiers(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_visits_day ON visits(day)`,
];

/**
 * Applied on every boot and allowed to fail: SQLite has no "ADD COLUMN IF NOT
 * EXISTS", so an already-migrated database simply throws "duplicate column".
 */
export const MIGRATION_STATEMENTS: string[] = [
  `ALTER TABLE products ADD COLUMN brand TEXT DEFAULT ''`,
  `ALTER TABLE products ADD COLUMN seo_title TEXT DEFAULT ''`,
  `ALTER TABLE products ADD COLUMN seo_description TEXT DEFAULT ''`,
  `ALTER TABLE categories ADD COLUMN show_on_home INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE categories ADD COLUMN seo_title TEXT DEFAULT ''`,
  `ALTER TABLE categories ADD COLUMN seo_description TEXT DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN user_id INTEGER`,
  `ALTER TABLE orders ADD COLUMN coupon_code TEXT DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN discount_total REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'iyzico'`,
  `ALTER TABLE orders ADD COLUMN tracking_number TEXT DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN carrier TEXT DEFAULT ''`,
  `ALTER TABLE orders ADD COLUMN admin_note TEXT DEFAULT ''`,
  `ALTER TABLE order_items ADD COLUMN variant_name TEXT DEFAULT ''`,
  `ALTER TABLE order_items ADD COLUMN list_price REAL NOT NULL DEFAULT 0`,
  `ALTER TABLE reviews ADD COLUMN user_id INTEGER`,
  `ALTER TABLE reviews ADD COLUMN image_url TEXT DEFAULT ''`,
  `ALTER TABLE reviews ADD COLUMN is_approved INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'owner'`,
];

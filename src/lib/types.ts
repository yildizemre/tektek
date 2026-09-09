export type Category = {
  id: number;
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
  created_at: string;
};

export type CategoryTree = Category & { children: Category[] };

export type Product = {
  id: number;
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
  rating: number;
  review_count: number;
  is_active: number;
  is_featured: number;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  created_at: string;
  category_name?: string | null;
  category_slug?: string | null;
};

export type ProductVariant = {
  id: number;
  product_id: number;
  name: string;
  color_hex: string;
  image_url: string;
  price_diff: number;
  stock: number;
  sort_order: number;
};

export type ProductTier = {
  id: number;
  product_id: number;
  quantity: number;
  discount_percent: number;
  badge: string;
  sort_order: number;
};

export type Campaign = {
  id: number;
  name: string;
  discount_percent: number;
  scope: "all" | "category" | "product";
  target_id: number | null;
  badge: string;
  starts_at: string;
  ends_at: string;
  is_active: number;
  created_at: string;
};

export type Coupon = {
  id: number;
  code: string;
  description: string;
  type: "percent" | "fixed";
  value: number;
  min_total: number;
  product_id: number | null;
  category_id: number | null;
  max_uses: number;
  used_count: number;
  starts_at: string;
  ends_at: string;
  is_active: number;
  created_at: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  password_hash: string;
  address: string;
  city: string;
  district: string;
  is_active: number;
  created_at: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed";

export type Order = {
  id: number;
  code: string;
  user_id: number | null;
  conversation_id: string;
  customer_name: string;
  email: string;
  phone: string;
  identity_number: string;
  address: string;
  city: string;
  district: string;
  zip_code: string;
  note: string;
  coupon_code: string;
  discount_total: number;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  payment_ref: string;
  payment_error: string;
  tracking_number: string;
  carrier: string;
  admin_note: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  variant_name: string;
  name: string;
  image_url: string;
  price: number;
  list_price: number;
  quantity: number;
};

export type Review = {
  id: number;
  product_id: number | null;
  user_id: number | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  image_url: string;
  is_approved: number;
  is_featured: number;
  created_at: string;
  product_name?: string | null;
  product_slug?: string | null;
};

export type Slide = {
  id: number;
  position: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  sort_order: number;
  is_active: number;
};

export type MenuLink = {
  id: number;
  section: string;
  label: string;
  href: string;
  sort_order: number;
  is_active: number;
};

export type Page = {
  id: number;
  slug: string;
  title: string;
  body: string;
  seo_title: string;
  seo_description: string;
  is_active: number;
  sort_order: number;
  updated_at: string;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: number;
};

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export type CartTier = { quantity: number; discount_percent: number };

export type CartLine = {
  key: string;
  productId: number;
  variantId: number | null;
  variantName: string;
  slug: string;
  name: string;
  price: number;
  listPrice: number;
  image: string;
  quantity: number;
  accent?: string;
  icon?: string;
  tiers?: CartTier[];
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ödeme bekliyor",
  paid: "Ödendi",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  preparing: "bg-blue-50 text-blue-700",
  shipped: "bg-indigo-50 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-50 text-red-600",
  refunded: "bg-zinc-100 text-zinc-600",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Bekliyor",
  paid: "Başarılı",
  failed: "Başarısız",
};

export const MENU_SECTIONS: { key: string; label: string }[] = [
  { key: "footer1", label: "Footer – 1. sütun" },
  { key: "footer2", label: "Footer – 2. sütun" },
  { key: "footer3", label: "Footer – 3. sütun" },
  { key: "topbar", label: "Üst bar bağlantıları" },
];

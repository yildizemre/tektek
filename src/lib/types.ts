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
  created_at: string;
};

export type CategoryTree = Category & { children: Category[] };

export type Product = {
  id: number;
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
  rating: number;
  review_count: number;
  is_active: number;
  is_featured: number;
  sort_order: number;
  created_at: string;
  category_name?: string | null;
  category_slug?: string | null;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";

export type Order = {
  id: number;
  code: string;
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
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_ref: string;
  payment_error: string;
  created_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
};

export type Review = {
  id: number;
  product_id: number | null;
  author: string;
  rating: number;
  title: string;
  body: string;
  is_featured: number;
  created_at: string;
};

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  accent?: string;
  icon?: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ödeme bekliyor",
  paid: "Ödendi",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Bekliyor",
  paid: "Başarılı",
  failed: "Başarısız",
};

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { initCheckoutForm, isIyzicoConfigured } from "@/lib/iyzico";
import { activeCampaigns, evaluateCoupon, priceProduct, tierUnitPrice } from "@/lib/pricing";
import {
  createOrder,
  generateOrderCode,
  getCampaigns,
  getCouponByCode,
  getProductCategoryIds,
  getProductsByIds,
  getSettings,
  getTiers,
  getVariants,
} from "@/lib/queries";
import { baseUrlFrom } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = { productId: number; quantity: number; variantId?: number | null };

type CheckoutBody = {
  customer: {
    name: string;
    email: string;
    phone: string;
    identityNumber?: string;
    address: string;
    city: string;
    district?: string;
    zipCode?: string;
    note?: string;
  };
  items: IncomingItem[];
  couponCode?: string;
};

export async function POST(request: Request) {
  let body: CheckoutBody;

  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const { customer, items } = body;
  if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !customer?.city) {
    return NextResponse.json({ ok: false, error: "Lütfen tüm zorunlu alanları doldurun." }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "Sepetiniz boş." }, { status: 400 });
  }

  const [products, campaigns, settings, session] = await Promise.all([
    getProductsByIds(items.map((item) => Number(item.productId))),
    getCampaigns(true),
    getSettings(),
    getSession(),
  ]);

  const liveCampaigns = activeCampaigns(campaigns);
  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = [];

  for (const item of items) {
    const product = productById.get(Number(item.productId));
    if (!product) continue;

    const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    const [variants, tiers, categoryIds] = await Promise.all([
      getVariants(product.id),
      getTiers(product.id),
      getProductCategoryIds(product.id),
    ]);

    const variant = variants.find((entry) => entry.id === Number(item.variantId)) ?? null;
    const priced = priceProduct(product, liveCampaigns, categoryIds);
    const unit = priced.price + (variant?.price_diff ?? 0);
    const finalUnit = tierUnitPrice(unit, tiers, quantity);

    orderItems.push({
      product_id: product.id,
      variant_name: variant?.name ?? "",
      name: variant ? `${product.name} — ${variant.name}` : product.name,
      image_url: variant?.image_url || product.image_url,
      price: finalUnit,
      list_price: priced.listPrice ?? unit,
      quantity,
    });
  }

  if (orderItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Sepetteki ürünler artık satışta değil." }, { status: 400 });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  let couponCode = "";

  if (body.couponCode) {
    const coupon = await getCouponByCode(body.couponCode);
    const check = evaluateCoupon(coupon, subtotal);
    if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400 });
    discount = check.discount;
    couponCode = check.coupon.code;
  }

  const threshold = Number(settings.free_shipping_threshold ?? 0);
  const baseShipping = Number(settings.shipping_cost ?? 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shipping = baseShipping > 0 && afterDiscount < threshold ? baseShipping : 0;

  const code = generateOrderCode();
  const order = await createOrder(
    {
      code,
      user_id: session?.role === "user" ? Number(session.sub) : null,
      conversation_id: `${code}-${Date.now()}`,
      customer_name: customer.name.trim(),
      email: customer.email.trim().toLowerCase(),
      phone: customer.phone.trim(),
      identity_number: (customer.identityNumber ?? "").trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      district: (customer.district ?? "").trim(),
      zip_code: (customer.zipCode ?? "").trim(),
      note: (customer.note ?? "").trim(),
      coupon_code: couponCode,
      discount_total: discount,
      subtotal,
      shipping_cost: shipping,
      total: afterDiscount + shipping,
      payment_method: isIyzicoConfigured() ? "iyzico" : "transfer",
    },
    orderItems,
  );

  if (!isIyzicoConfigured()) {
    return NextResponse.json({ ok: true, mode: "manual", redirectUrl: `/siparis/${order.code}` });
  }

  const result = await initCheckoutForm(
    order,
    orderItems.map((item, index) => ({ ...item, id: index, order_id: order.id })),
    `${baseUrlFrom(request)}/api/iyzico/callback`,
  );

  if (!result.ok || !result.paymentPageUrl) {
    return NextResponse.json({
      ok: false,
      error: result.ok ? "iyzico ödeme sayfası alınamadı." : result.error,
      orderCode: order.code,
    }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    mode: "iyzico",
    orderCode: order.code,
    redirectUrl: result.paymentPageUrl,
  });
}

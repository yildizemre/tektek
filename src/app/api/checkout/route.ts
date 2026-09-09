import { NextResponse } from "next/server";

import { initCheckoutForm, isIyzicoConfigured } from "@/lib/iyzico";
import { createOrder, generateOrderCode, getProductsByIds, getSettings } from "@/lib/queries";
import { baseUrlFrom } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingItem = { productId: number; quantity: number };

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

  // Prices always come from the database, never from the browser.
  const products = await getProductsByIds(items.map((item) => Number(item.productId)));
  const productById = new Map(products.map((product) => [product.id, product]));

  const orderItems = items
    .map((item) => {
      const product = productById.get(Number(item.productId));
      if (!product) return null;
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));

      return {
        product_id: product.id,
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        quantity,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (orderItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Sepetteki ürünler artık satışta değil." }, { status: 400 });
  }

  const settings = await getSettings();
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const threshold = Number(settings.free_shipping_threshold ?? 0);
  const baseShipping = Number(settings.shipping_cost ?? 0);
  const shipping = baseShipping > 0 && subtotal < threshold ? baseShipping : 0;

  const code = generateOrderCode();
  const order = await createOrder(
    {
      code,
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
      subtotal,
      shipping_cost: shipping,
      total: subtotal + shipping,
    },
    orderItems,
  );

  if (!isIyzicoConfigured()) {
    return NextResponse.json({
      ok: true,
      mode: "manual",
      redirectUrl: `/siparis/${order.code}`,
    });
  }

  const callbackUrl = `${baseUrlFrom(request)}/api/iyzico/callback`;
  const result = await initCheckoutForm(
    order,
    orderItems.map((item, index) => ({ ...item, id: index, order_id: order.id })),
    callbackUrl,
  );

  if (!result.ok || !result.paymentPageUrl) {
    const message = result.ok ? "iyzico ödeme sayfası alınamadı." : result.error;
    return NextResponse.json({ ok: false, error: message, orderCode: order.code }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    mode: "iyzico",
    orderCode: order.code,
    redirectUrl: result.paymentPageUrl,
  });
}

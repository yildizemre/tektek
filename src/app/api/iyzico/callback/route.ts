import { NextResponse } from "next/server";

import { retrieveCheckoutForm } from "@/lib/iyzico";
import { getOrderByCode, markOrderFailed, markOrderPaid } from "@/lib/queries";
import { baseUrlFrom } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** iyzico posts the checkout token back here once the buyer finishes the 3D flow. */
export async function POST(request: Request) {
  const base = baseUrlFrom(request);
  const formData = await request.formData().catch(() => null);
  const token = String(formData?.get("token") ?? "");

  if (!token) {
    return NextResponse.redirect(`${base}/odeme/sonuc?durum=hata`, 303);
  }

  const result = await retrieveCheckoutForm(token);
  const order = result.basketId ? await getOrderByCode(result.basketId) : null;

  if (!order) {
    return NextResponse.redirect(`${base}/odeme/sonuc?durum=hata`, 303);
  }

  if (result.success) {
    await markOrderPaid(order.id, result.paymentId);
    return NextResponse.redirect(`${base}/siparis/${order.code}`, 303);
  }

  await markOrderFailed(order.id, result.message);
  return NextResponse.redirect(
    `${base}/odeme/sonuc?durum=basarisiz&kod=${order.code}&mesaj=${encodeURIComponent(result.message)}`,
    303,
  );
}

export async function GET(request: Request) {
  return NextResponse.redirect(`${baseUrlFrom(request)}/odeme/sonuc?durum=hata`, 303);
}

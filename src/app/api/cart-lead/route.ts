import { NextResponse } from "next/server";

import { upsertCartLead } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  token?: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  items?: { name?: string; quantity?: number; price?: number; slug?: string }[];
};

const clip = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

/** Ödeme sayfasında telefonunu yazıp siparişi bitirmeyen ziyaretçileri kaydeder. */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = clip(body.token, 64);
  const phone = clip(body.phone, 32);
  if (!/^[\w-]{8,64}$/.test(token) || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const items = (Array.isArray(body.items) ? body.items : []).slice(0, 30).map((item) => ({
    name: clip(item.name, 160),
    quantity: Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1))),
    price: Math.max(0, Number(item.price) || 0),
    slug: clip(item.slug, 160),
  }));
  if (items.length === 0) return NextResponse.json({ ok: false }, { status: 400 });

  await upsertCartLead({
    token,
    name: clip(body.name, 120),
    phone,
    email: clip(body.email, 160),
    city: clip(body.city, 60),
    items: JSON.stringify(items),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  });

  return NextResponse.json({ ok: true });
}

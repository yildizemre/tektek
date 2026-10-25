import { NextResponse } from "next/server";

import { saveMedia } from "@/lib/queries";

export const runtime = "nodejs";

/** Müşteri yorum fotoğrafları: tarayıcıda küçültülmüş webp/jpeg/png, en fazla 2 MB. */
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Basit kötüye kullanım koruması: IP başına 10 dakikada en fazla 15 fotoğraf.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 15;
const hits = new Map<string, number[]>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allowed(ip)) {
    return NextResponse.json({ error: "Çok fazla fotoğraf yüklendi, biraz sonra tekrar deneyin." }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Sadece JPG, PNG veya WEBP fotoğraf yükleyebilirsiniz." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Fotoğraf çok büyük." }, { status: 413 });
  }

  const id = await saveMedia({
    name: `yorum-${file.name}`.slice(0, 120),
    mime: file.type,
    data: buffer.toString("base64"),
    size: buffer.byteLength,
  });

  return NextResponse.json({ url: `/api/media/${id}`, id });
}

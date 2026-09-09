import { NextResponse } from "next/server";

import { getAdmin } from "@/lib/auth";
import { saveMedia } from "@/lib/queries";

export const runtime = "nodejs";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/x-icon"];

export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Sadece görsel dosyaları yükleyebilirsiniz." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "Görsel çok büyük. Lütfen 3 MB altında bir dosya seçin." },
      { status: 413 },
    );
  }

  const id = await saveMedia({
    name: file.name.slice(0, 120),
    mime: file.type,
    data: buffer.toString("base64"),
    size: buffer.byteLength,
  });

  return NextResponse.json({ url: `/api/media/${id}`, id });
}

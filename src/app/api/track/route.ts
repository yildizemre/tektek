import { NextResponse } from "next/server";

import { recordVisit } from "@/lib/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string; visitor?: string };
    const path = (body.path ?? "/").slice(0, 200);
    const visitor = (body.visitor ?? "").slice(0, 64);

    if (!visitor || path.startsWith("/admin")) return NextResponse.json({ ok: true });

    await recordVisit(path, visitor);
  } catch {
    // Analytics must never break a page view.
  }

  return NextResponse.json({ ok: true });
}

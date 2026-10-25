import { after, NextResponse } from "next/server";

import { createJob, failStaleJobs, listJobs, processJob, type AiJobParams } from "@/lib/ai";
import { getAdmin } from "@/lib/auth";
import { baseUrlFrom } from "@/lib/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  await failStaleJobs();
  return NextResponse.json({ jobs: await listJobs() });
}

type Body = { kind?: string; prompt?: string; params?: AiJobParams };

export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const kind = body.kind === "video" ? "video" : "image";
  const prompt = String(body.prompt ?? "").trim().slice(0, 4000);
  if (prompt.length < 3) return NextResponse.json({ error: "Lütfen ne üretmek istediğini yaz." }, { status: 400 });

  const params: AiJobParams = {
    referenceImage: body.params?.referenceImage ? String(body.params.referenceImage).slice(0, 500) : undefined,
    size: body.params?.size ? String(body.params.size).slice(0, 20) : undefined,
    quality: body.params?.quality ? String(body.params.quality).slice(0, 10) : undefined,
    count: body.params?.count ? Number(body.params.count) : undefined,
    aspectRatio: body.params?.aspectRatio === "16:9" ? "16:9" : "9:16",
    resolution: body.params?.resolution ? String(body.params.resolution).slice(0, 10) : undefined,
  };

  const id = await createJob(kind, prompt, params);

  if (process.env.NETLIFY) {
    // Netlify'de normal istek ~26 sn'de kesilir; üretimi arka plan fonksiyonuna devret.
    await fetch(`${baseUrlFrom(request)}/.netlify/functions/ai-worker-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-worker-secret": process.env.AUTH_SECRET ?? "" },
      body: JSON.stringify({ id }),
    }).catch(() => undefined);
  } else {
    after(() => processJob(id));
  }

  return NextResponse.json({ ok: true, id });
}

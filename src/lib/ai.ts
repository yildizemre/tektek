/**
 * AI görsel / video üretimi. Bu dosya hem Next sunucusundan hem de Netlify arka plan
 * fonksiyonundan (netlify/functions/ai-worker-background.mts) çağrılır; bu yüzden
 * yalnızca göreli import kullanır, "@/..." veya next/* kullanmaz.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

import { all, one, run } from "./db";

/* ----------------------------------------------------------------- ayarlar */

export const SECRET_KEYS = {
  openai: "openai_api_key",
  gemini: "gemini_api_key",
  imageModel: "openai_image_model",
  videoModel: "gemini_video_model",
} as const;

export const DEFAULT_IMAGE_MODEL = "gpt-image-2.5-flare";
export const DEFAULT_VIDEO_MODEL = "gemini-omni-1.1-flash";

const ENV_FALLBACK: Record<string, string | undefined> = {
  [SECRET_KEYS.openai]: process.env.OPENAI_API_KEY,
  [SECRET_KEYS.gemini]: process.env.GEMINI_API_KEY,
};

/** Anahtarlar `settings` yerine ayrı tabloda tutulur; mağaza sayfalarına hiçbir zaman gönderilmez. */
export async function getSecret(key: string): Promise<string> {
  const row = await one<{ value: string }>("SELECT value FROM secrets WHERE key = ?", [key]);
  return row?.value || ENV_FALLBACK[key] || "";
}

export async function setSecret(key: string, value: string) {
  await run(
    "INSERT INTO secrets (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export function maskSecret(value: string): string {
  if (!value) return "";
  return value.length <= 10 ? "••••" : `${value.slice(0, 5)}••••${value.slice(-4)}`;
}

/* ------------------------------------------------------------------ dosyalar */

/** Netlify'de Netlify Blobs, lokalde data/ai klasörü. */
async function blobStore() {
  if (!process.env.NETLIFY && !process.env.NETLIFY_BLOBS_CONTEXT) return null;
  const { getStore } = await import("@netlify/blobs");
  return getStore("ai-media");
}

const LOCAL_DIR = path.join(process.cwd(), "data", "ai");

export async function saveFile(bytes: Uint8Array, mime: string): Promise<string> {
  const extension = mime.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const key = `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}.${extension}`;
  const store = await blobStore();

  if (store) {
    await store.set(key, new Blob([new Uint8Array(bytes)], { type: mime }), { metadata: { mime } });
  } else {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, key), bytes);
  }
  return `/api/ai-file/${key}`;
}

export async function readFile(key: string): Promise<{ bytes: Uint8Array; mime: string } | null> {
  if (!/^[\w-]+\.\w+$/.test(key)) return null;
  const mime = mimeFor(key);
  const store = await blobStore();

  if (store) {
    const data = await store.get(key, { type: "arrayBuffer" });
    return data ? { bytes: new Uint8Array(data), mime } : null;
  }
  try {
    return { bytes: new Uint8Array(await fs.readFile(path.join(LOCAL_DIR, key))), mime };
  } catch {
    return null;
  }
}

function mimeFor(key: string): string {
  const extension = key.split(".").pop()?.toLowerCase();
  if (extension === "mp4") return "video/mp4";
  if (extension === "webm") return "video/webm";
  if (extension === "png") return "image/png";
  if (extension === "jpg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return "application/octet-stream";
}

/* ------------------------------------------------------------------- işler */

export type AiJobParams = {
  /** Referans görsel: /api/media/12 veya tam URL. */
  referenceImage?: string;
  size?: string;
  quality?: string;
  count?: number;
  aspectRatio?: "9:16" | "16:9";
  resolution?: string;
};

export type AiJob = {
  id: number;
  kind: "image" | "video";
  prompt: string;
  params: string;
  status: "queued" | "running" | "done" | "failed";
  results: string;
  error: string;
  created_at: string;
  updated_at: string;
};

export async function createJob(kind: AiJob["kind"], prompt: string, params: AiJobParams): Promise<number> {
  const result = await run("INSERT INTO ai_jobs (kind, prompt, params) VALUES (?, ?, ?)", [
    kind,
    prompt,
    JSON.stringify(params),
  ]);
  return Number(result.lastInsertRowid);
}

export async function listJobs(limit = 40): Promise<AiJob[]> {
  return all<AiJob>("SELECT * FROM ai_jobs ORDER BY id DESC LIMIT ?", [limit]);
}

export async function deleteJob(id: number) {
  await run("DELETE FROM ai_jobs WHERE id = ?", [id]);
}

async function updateJob(id: number, fields: Partial<Pick<AiJob, "status" | "results" | "error">>) {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return;
  await run(
    `UPDATE ai_jobs SET ${keys.map((key) => `${key} = ?`).join(", ")}, updated_at = datetime('now') WHERE id = ?`,
    [...keys.map((key) => fields[key] ?? ""), id],
  );
}

/** İşi çalıştırır. Tekrar çağrılırsa yalnızca "queued" durumdaki işi alır. */
export async function processJob(id: number) {
  const claimed = await run(
    "UPDATE ai_jobs SET status = 'running', updated_at = datetime('now') WHERE id = ? AND status = 'queued'",
    [id],
  );
  if (!claimed.rowsAffected) return;

  const job = await one<AiJob>("SELECT * FROM ai_jobs WHERE id = ?", [id]);
  if (!job) return;

  try {
    const params = JSON.parse(job.params || "{}") as AiJobParams;
    const results = job.kind === "video" ? await generateVideo(job.prompt, params) : await generateImages(job.prompt, params);
    await updateJob(id, { status: "done", results: JSON.stringify(results), error: "" });
  } catch (error) {
    await updateJob(id, { status: "failed", error: error instanceof Error ? error.message : String(error) });
  }
}

/** 20 dakikadan uzun süredir "running" kalan işler (zaman aşımı) başarısız sayılır. */
export async function failStaleJobs() {
  await run(
    `UPDATE ai_jobs SET status = 'failed', error = 'Zaman aşımı: iş tamamlanamadı.', updated_at = datetime('now')
     WHERE status IN ('running', 'queued') AND updated_at < datetime('now', '-20 minutes')`,
  );
}

/* -------------------------------------------------------- referans görsel */

async function loadReference(source: string | undefined): Promise<{ bytes: Uint8Array; mime: string } | null> {
  if (!source) return null;

  const media = source.match(/^\/api\/media\/(\d+)$/);
  if (media) {
    const row = await one<{ mime: string; data: string }>("SELECT mime, data FROM media WHERE id = ?", [Number(media[1])]);
    return row ? { bytes: new Uint8Array(Buffer.from(row.data, "base64")), mime: row.mime } : null;
  }

  const local = source.match(/^\/api\/ai-file\/([\w.-]+)$/);
  if (local) return readFile(local[1]);

  if (source.startsWith("/")) {
    try {
      const bytes = await fs.readFile(path.join(process.cwd(), "public", source));
      return { bytes: new Uint8Array(bytes), mime: mimeFor(source) };
    } catch {
      const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
      if (!base) return null;
      source = `${base.replace(/\/$/, "")}${source}`;
    }
  }

  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);
    if (!response.ok) return null;
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      mime: response.headers.get("content-type")?.split(";")[0] || "image/jpeg",
    };
  }
  return null;
}

/* -------------------------------------------------------- OpenAI görsel */

async function apiError(response: Response, service: string): Promise<Error> {
  const text = await response.text().catch(() => "");
  let message = text.slice(0, 400);
  try {
    const parsed = JSON.parse(text) as { error?: { message?: string } | string };
    message = typeof parsed.error === "string" ? parsed.error : parsed.error?.message || message;
  } catch {
    // düz metin
  }
  return new Error(`${service} hatası (${response.status}): ${message || response.statusText}`);
}

async function generateImages(prompt: string, params: AiJobParams): Promise<string[]> {
  const key = await getSecret(SECRET_KEYS.openai);
  if (!key) throw new Error("OpenAI API anahtarı girilmemiş. Panel > AI Stüdyo > Ayarlar.");

  const model = (await getSecret(SECRET_KEYS.imageModel)) || DEFAULT_IMAGE_MODEL;
  const count = Math.max(1, Math.min(4, Math.floor(params.count ?? 1)));
  const size = params.size || "1024x1536";
  const quality = params.quality || "high";
  const reference = await loadReference(params.referenceImage);

  let response: Response;
  if (reference) {
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("n", String(count));
    form.append("size", size);
    form.append("quality", quality);
    form.append("output_format", "webp");
    const extension = reference.mime.split("/")[1] ?? "png";
    form.append("image[]", new Blob([new Uint8Array(reference.bytes)], { type: reference.mime }), `reference.${extension}`);
    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, n: count, size, quality, output_format: "webp" }),
    });
  }

  if (!response.ok) throw await apiError(response, "OpenAI");

  const data = (await response.json()) as { data?: { b64_json?: string; url?: string }[] };
  const urls: string[] = [];
  for (const item of data.data ?? []) {
    if (item.b64_json) {
      urls.push(await saveFile(new Uint8Array(Buffer.from(item.b64_json, "base64")), "image/webp"));
    } else if (item.url) {
      const file = await fetch(item.url);
      if (file.ok) urls.push(await saveFile(new Uint8Array(await file.arrayBuffer()), file.headers.get("content-type") || "image/png"));
    }
  }
  if (urls.length === 0) throw new Error("OpenAI görsel döndürmedi.");
  return urls;
}

/* -------------------------------------------------------- Gemini video */

type GeminiContent = { type?: string; data?: string; mime_type?: string; uri?: string };
type GeminiInteraction = {
  status?: string;
  error?: { message?: string };
  steps?: { type?: string; content?: GeminiContent[] }[];
  output_video?: { uri?: string };
};

async function generateVideo(prompt: string, params: AiJobParams): Promise<string[]> {
  const key = await getSecret(SECRET_KEYS.gemini);
  if (!key) throw new Error("Google Gemini API anahtarı girilmemiş. Panel > AI Stüdyo > Ayarlar.");

  const model = (await getSecret(SECRET_KEYS.videoModel)) || DEFAULT_VIDEO_MODEL;
  const reference = await loadReference(params.referenceImage);

  const input = reference
    ? [
        { type: "image", data: Buffer.from(reference.bytes).toString("base64"), mime_type: reference.mime },
        { type: "text", text: prompt },
      ]
    : prompt;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      input,
      response_format: {
        type: "video",
        aspect_ratio: params.aspectRatio || "9:16",
        resolution: params.resolution || "720p",
        delivery: "uri",
      },
    }),
  });

  if (!response.ok) throw await apiError(response, "Gemini");
  const result = (await response.json()) as GeminiInteraction;
  if (result.error?.message) throw new Error(`Gemini: ${result.error.message}`);

  const outputs = (result.steps ?? []).filter((step) => step.type === "model_output").flatMap((step) => step.content ?? []);
  const inline = outputs.find((item) => item.type === "video" && item.data);
  if (inline?.data) {
    return [await saveFile(new Uint8Array(Buffer.from(inline.data, "base64")), inline.mime_type || "video/mp4")];
  }

  const uri = result.output_video?.uri || outputs.find((item) => item.type === "video" && item.uri)?.uri;
  if (!uri) throw new Error(`Gemini video döndürmedi (durum: ${result.status ?? "bilinmiyor"}).`);

  const bytes = await downloadGeminiFile(uri, key);
  return [await saveFile(bytes, "video/mp4")];
}

/** URI ile gelen dosya hazır olana kadar bekler (en fazla ~10 dk) ve indirir. */
async function downloadGeminiFile(uri: string, key: string): Promise<Uint8Array> {
  const deadline = Date.now() + 10 * 60 * 1000;
  let lastStatus = 0;

  while (Date.now() < deadline) {
    const response = await fetch(uri, { headers: { "x-goog-api-key": key }, redirect: "follow" });
    lastStatus = response.status;
    const type = response.headers.get("content-type") || "";

    if (response.ok && !type.includes("json")) return new Uint8Array(await response.arrayBuffer());
    if (response.ok && type.includes("json")) {
      const meta = (await response.json()) as { state?: string; error?: { message?: string } };
      if (meta.state === "FAILED") throw new Error(`Gemini video üretilemedi: ${meta.error?.message ?? ""}`);
    } else if (response.status !== 404 && response.status !== 409 && response.status < 500) {
      throw await apiError(response, "Gemini indirme");
    }
    await new Promise((resolve) => setTimeout(resolve, 8000));
  }
  throw new Error(`Gemini videosu zamanında hazır olmadı (son durum ${lastStatus}).`);
}

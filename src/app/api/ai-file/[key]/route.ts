import { readFile } from "@/lib/ai";

export const runtime = "nodejs";

/** AI ile üretilen görsel ve videolar (rastgele anahtarlı, paylaşım için herkese açık). */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const file = await readFile(key);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${key}"`,
    },
  });
}

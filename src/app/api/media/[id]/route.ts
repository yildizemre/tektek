import { getMedia } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const media = await getMedia(Number(id));

  if (!media) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(media.data, "base64");

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": media.mime,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

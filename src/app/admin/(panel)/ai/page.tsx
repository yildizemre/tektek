import { AiStudio } from "@/components/admin/ai-studio";
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_VIDEO_MODEL,
  getSecret,
  listJobs,
  maskSecret,
  SECRET_KEYS,
} from "@/lib/ai";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Stüdyo" };

export default async function AiStudioPage() {
  const [openai, gemini, imageModel, videoModel, jobs, products] = await Promise.all([
    getSecret(SECRET_KEYS.openai),
    getSecret(SECRET_KEYS.gemini),
    getSecret(SECRET_KEYS.imageModel),
    getSecret(SECRET_KEYS.videoModel),
    listJobs(),
    getProducts({ includeInactive: true, limit: 200 }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">AI Stüdyo</h1>
        <p className="text-sm text-ink-400">
          Ürün fotoğraflarından Instagram görseli ve kısa video üret. Sonuçlar aşağıda listelenir, indirip paylaşabilirsin.
        </p>
      </header>

      <AiStudio
        initialJobs={jobs}
        products={products
          .filter((product) => product.image_url)
          .map((product) => ({ id: product.id, name: product.name, image: product.image_url }))}
        settings={{
          openaiMasked: maskSecret(openai),
          geminiMasked: maskSecret(gemini),
          imageModel: imageModel || DEFAULT_IMAGE_MODEL,
          videoModel: videoModel || DEFAULT_VIDEO_MODEL,
        }}
      />
    </div>
  );
}

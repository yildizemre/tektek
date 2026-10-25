// Netlify "-background" fonksiyonu: 15 dakikaya kadar çalışabilir, AI üretimi burada yapılır.
import { processJob } from "../../src/lib/ai";

const aiWorker = async (request: Request) => {
  if (request.headers.get("x-worker-secret") !== process.env.AUTH_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }
  const { id } = (await request.json().catch(() => ({}))) as { id?: number };
  if (id) await processJob(Number(id));
  return new Response("ok");
};

export default aiWorker;

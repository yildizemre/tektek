"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Download, ImageIcon, KeyRound, Loader2, Sparkles, Trash2, Video } from "lucide-react";

import { deleteAiJobAction, saveAiSettingsAction, type FormState } from "@/app/admin/actions";
import type { AiJob } from "@/lib/ai";

import { ImageUpload } from "./image-upload";

const FIELD = "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

type ProductOption = { id: number; name: string; image: string };
type Settings = { openaiMasked: string; geminiMasked: string; imageModel: string; videoModel: string };

const IMAGE_PRESETS = [
  {
    label: "Instagram gönderisi",
    size: "1024x1024",
    prompt:
      "Bu ürünü stüdyo ışığında, sade ve modern bir arka planda, profesyonel e-ticaret reklam fotoğrafı olarak göster. Ürünün şekli, rengi ve logosu aynen korunsun.",
  },
  {
    label: "Hikâye / Reels kapağı",
    size: "1024x1536",
    prompt:
      "Bu ürünü dikey Instagram hikâyesi için, canlı renkli gradyan arka planda, üstte boşluk bırakarak dinamik bir kompozisyonla göster. Ürün aynen korunsun.",
  },
  {
    label: "Günlük kullanım",
    size: "1024x1536",
    prompt:
      "Bu ürünü günlük hayatta kullanılırken, doğal ışıkta, gerçekçi bir yaşam tarzı fotoğrafında göster. Ürünün tasarımı birebir aynı kalsın.",
  },
];

const VIDEO_PRESETS = [
  { label: "Ürün tanıtımı", prompt: "Ürün etrafında yavaşça dönen sinematik kamera hareketi, stüdyo ışığı, yansımalı zemin, premium reklam havası." },
  { label: "Kutu açılışı", prompt: "Ürünün kutusundan çıkarıldığı, eller görünen, doğal ışıkta kısa bir kutu açılış videosu." },
  { label: "Kullanım anı", prompt: "Ürünün günlük hayatta kullanıldığı, dinamik ve enerjik kısa bir reklam sahnesi." },
];

export function AiStudio({
  initialJobs,
  products,
  settings,
}: {
  initialJobs: AiJob[];
  products: ProductOption[];
  settings: Settings;
}) {
  const [tab, setTab] = useState<"image" | "video" | "settings">(
    settings.openaiMasked || settings.geminiMasked ? "image" : "settings",
  );
  const [jobs, setJobs] = useState(initialJobs);
  const busy = jobs.some((job) => job.status === "queued" || job.status === "running");

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(async () => {
      const response = await fetch("/api/admin/ai", { cache: "no-store" }).catch(() => null);
      if (response?.ok) setJobs(((await response.json()) as { jobs: AiJob[] }).jobs);
    }, 5000);
    return () => clearInterval(timer);
  }, [busy]);

  async function refresh() {
    const response = await fetch("/api/admin/ai", { cache: "no-store" }).catch(() => null);
    if (response?.ok) setJobs(((await response.json()) as { jobs: AiJob[] }).jobs);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
      <section className="h-fit space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <div className="flex gap-1 rounded-full bg-ink-50 p-1">
          {[
            { key: "image" as const, label: "Görsel", icon: ImageIcon },
            { key: "video" as const, label: "Video", icon: Video },
            { key: "settings" as const, label: "Ayarlar", icon: KeyRound },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
                tab === item.key ? "bg-white shadow-sm" : "text-ink-500"
              }`}
            >
              <item.icon className="size-4" /> {item.label}
            </button>
          ))}
        </div>

        {tab === "settings" ? (
          <SettingsPanel settings={settings} />
        ) : (
          <GeneratePanel
            key={tab}
            kind={tab}
            products={products}
            missingKey={tab === "image" ? !settings.openaiMasked : !settings.geminiMasked}
            onCreated={refresh}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold">Üretilenler</h2>
        {jobs.length === 0 && (
          <p className="rounded-3xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">
            Henüz bir şey üretilmedi.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}

function GeneratePanel({
  kind,
  products,
  missingKey,
  onCreated,
}: {
  kind: "image" | "video";
  products: ProductOption[];
  missingKey: boolean;
  onCreated: () => void;
}) {
  const presets = kind === "image" ? IMAGE_PRESETS : VIDEO_PRESETS;
  const [prompt, setPrompt] = useState(presets[0].prompt);
  const [size, setSize] = useState(IMAGE_PRESETS[0].size);
  const [reference, setReference] = useState(products[0]?.image ?? "");
  const [uploadKey, setUploadKey] = useState(0);
  const [count, setCount] = useState(1);
  const [aspect, setAspect] = useState<"9:16" | "16:9">("9:16");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        prompt,
        params:
          kind === "image"
            ? { referenceImage: reference || undefined, size, count, quality: "high" }
            : { referenceImage: reference || undefined, aspectRatio: aspect, resolution: "720p" },
      }),
    }).catch(() => null);
    setPending(false);

    if (!response?.ok) {
      const data = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
      setError(data?.error ?? "İstek gönderilemedi.");
      return;
    }
    onCreated();
  }

  return (
    <div className="space-y-4">
      {missingKey && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Önce Ayarlar sekmesinden {kind === "image" ? "OpenAI" : "Google Gemini"} API anahtarını gir.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setPrompt(preset.prompt);
              if ("size" in preset) setSize(preset.size as string);
            }}
            className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold hover:bg-ink-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className={LABEL}>Ne istiyorsun?</span>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} className={FIELD} />
      </label>

      <div className="space-y-1.5">
        <span className={LABEL}>Referans ürün fotoğrafı</span>
        <select
          value={products.some((product) => product.image === reference) ? reference : ""}
          onChange={(event) => {
            setReference(event.target.value);
            setUploadKey((value) => value + 1);
          }}
          className={FIELD}
        >
          <option value="">Referans yok / kendi fotoğrafım</option>
          {products.map((product) => (
            <option key={product.id} value={product.image}>
              {product.name}
            </option>
          ))}
        </select>
        <ImageUpload
          key={uploadKey}
          name="__reference"
          defaultValue={reference}
          hint="Listeden ürün seç ya da bilgisayardan fotoğraf yükle."
          onChange={setReference}
        />
      </div>

      {kind === "image" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className={LABEL}>Boyut</span>
            <select value={size} onChange={(event) => setSize(event.target.value)} className={FIELD}>
              <option value="1024x1024">Kare (gönderi)</option>
              <option value="1024x1536">Dikey (hikâye)</option>
              <option value="1536x1024">Yatay</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className={LABEL}>Adet</span>
            <select value={count} onChange={(event) => setCount(Number(event.target.value))} className={FIELD}>
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <label className="block space-y-1.5">
          <span className={LABEL}>Format</span>
          <select value={aspect} onChange={(event) => setAspect(event.target.value as "9:16" | "16:9")} className={FIELD}>
            <option value="9:16">Dikey 9:16 (Reels / TikTok)</option>
            <option value="16:9">Yatay 16:9 (YouTube)</option>
          </select>
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={pending || missingKey || prompt.trim().length < 3}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {kind === "image" ? "Görsel oluştur" : "Video oluştur"}
      </button>
      <p className="text-center text-[11px] text-ink-400">
        {kind === "image" ? "Görseller genelde 20-60 saniye sürer." : "Videolar birkaç dakika sürebilir; sayfadan çıkabilirsin."}
      </p>
    </div>
  );
}

function SettingsPanel({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveAiSettingsAction, {});

  return (
    <form action={action} className="space-y-4">
      <KeyField name="openai_api_key" label="OpenAI API anahtarı (görsel)" masked={settings.openaiMasked} placeholder="sk-..." />
      <KeyField name="gemini_api_key" label="Google Gemini API anahtarı (video)" masked={settings.geminiMasked} placeholder="AIza..." />

      <details className="rounded-2xl bg-ink-50 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">Gelişmiş: model adları</summary>
        <div className="mt-3 space-y-3">
          <input name="openai_image_model" defaultValue={settings.imageModel} className={FIELD} />
          <input name="gemini_video_model" defaultValue={settings.videoModel} className={FIELD} />
          <p className="text-xs text-ink-400">Sağlayıcı yeni model çıkarırsa adını buradan değiştirebilirsin.</p>
        </div>
      </details>

      <ul className="space-y-1 text-xs text-ink-400">
        <li>
          OpenAI anahtarı: <span className="font-semibold">platform.openai.com → API keys</span>
        </li>
        <li>
          Gemini anahtarı: <span className="font-semibold">aistudio.google.com → Get API key</span>
        </li>
        <li>Anahtarlar sadece sunucuda saklanır, site ziyaretçilerine hiçbir zaman gönderilmez.</li>
      </ul>

      {state.success && (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {state.success}
        </p>
      )}
      <button disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-bold text-white">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Kaydet
      </button>
    </form>
  );
}

function KeyField({ name, label, masked, placeholder }: { name: string; label: string; masked: string; placeholder: string }) {
  return (
    <label className="block space-y-1.5">
      <span className={LABEL}>{label}</span>
      <input name={name} type="password" autoComplete="off" placeholder={masked ? `Kayıtlı: ${masked}` : placeholder} className={FIELD} />
      {masked && (
        <span className="flex items-center gap-2 text-xs text-ink-400">
          <input type="checkbox" name={`${name}_clear`} /> Kayıtlı anahtarı sil
        </span>
      )}
    </label>
  );
}

function JobCard({ job }: { job: AiJob }) {
  let results: string[] = [];
  try {
    results = JSON.parse(job.results || "[]");
  } catch {
    results = [];
  }
  const working = job.status === "queued" || job.status === "running";

  return (
    <article className="space-y-3 rounded-3xl border border-ink-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold">
          {job.kind === "video" ? <Video className="size-3.5" /> : <ImageIcon className="size-3.5" />}
          {job.kind === "video" ? "Video" : "Görsel"} · #{job.id}
        </span>
        <form action={deleteAiJobAction}>
          <input type="hidden" name="id" value={job.id} />
          <button aria-label="Sil" className="rounded-full p-1.5 text-ink-300 hover:bg-red-50 hover:text-red-500">
            <Trash2 className="size-4" />
          </button>
        </form>
      </div>

      {working && (
        <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-ink-50 via-brand-50 to-ink-50">
          <div className="flex flex-col items-center gap-2 text-sm font-semibold text-ink-500">
            <Loader2 className="size-6 animate-spin" />
            {job.status === "queued" ? "Sırada..." : job.kind === "video" ? "Video hazırlanıyor..." : "Görsel hazırlanıyor..."}
          </div>
        </div>
      )}

      {job.status === "failed" && <p className="rounded-2xl bg-red-50 p-3 text-xs text-red-700">{job.error}</p>}

      {results.length > 0 && (
        <div className={`grid gap-2 ${results.length > 1 ? "grid-cols-2" : ""}`}>
          {results.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-2xl bg-ink-50">
              {job.kind === "video" ? (
                <video src={url} controls playsInline loop className="w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="w-full" />
              )}
              <a
                href={url}
                download
                className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-ink-900/80 px-2.5 py-1 text-[11px] font-bold text-white"
              >
                <Download className="size-3.5" /> İndir
              </a>
            </div>
          ))}
        </div>
      )}

      <p className="line-clamp-2 text-xs text-ink-400">{job.prompt}</p>
    </article>
  );
}

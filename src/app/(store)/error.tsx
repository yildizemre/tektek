"use client";

import Link from "next/link";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink-300">Hata 500</p>
      <p className="text-7xl font-black tracking-tight">500</p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Sayfa şu an yüklenemedi</h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-400">
        Geçici bir sorun oluştu. Tekrar denemek veya alışverişe ana sayfadan devam etmek için
        aşağıdaki seçenekleri kullan.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white"
        >
          Tekrar dene
        </button>
        <Link href="/" className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold">
          Anasayfa
        </Link>
      </div>
    </div>
  );
}

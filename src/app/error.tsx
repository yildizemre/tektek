"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#0b0d18] px-6 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Hata 500</p>
      <p className="text-7xl font-black tracking-tight">500</p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Bir şeyler ters gitti</h1>
      <p className="max-w-md text-sm leading-relaxed text-white/60">
        Beklenmeyen bir sunucu hatası oluştu. Bir süre sonra tekrar dene veya ana sayfaya dön.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900"
        >
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold"
        >
          Anasayfa
        </Link>
      </div>
    </div>
  );
}

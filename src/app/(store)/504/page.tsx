import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "504 — Zaman aşımı",
  robots: { index: false, follow: false },
};

export default function GatewayTimeoutPage() {
  return (
    <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink-300">Hata 504</p>
      <p className="text-7xl font-black tracking-tight">504</p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Bağlantı zaman aşımına uğradı</h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-400">
        Sunucu yanıt vermekte gecikti. Birkaç saniye bekleyip tekrar dene; ödeme sayfasındaysan
        siparişini Hesabım üzerinden kontrol et, çift ödeme yapma.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white">
          Anasayfaya dön
        </Link>
        <Link
          href="/hesap/siparislerim"
          className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold"
        >
          Siparişlerim
        </Link>
      </div>
    </div>
  );
}

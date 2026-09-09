import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#0b0d18] px-6 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Hata 404</p>
      <p className="text-7xl font-black tracking-tight sm:text-8xl">404</p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Bu sayfa bulunamadı</h1>
      <p className="max-w-md text-sm leading-relaxed text-white/60">
        Aradığın bağlantı taşınmış, silinmiş veya hiç var olmamış olabilir. Ana sayfadan veya
        arama ile devam edebilirsin.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-ink-900">
          Anasayfaya dön
        </Link>
        <Link
          href="/arama"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
        >
          Ürün ara
        </Link>
      </div>
    </div>
  );
}

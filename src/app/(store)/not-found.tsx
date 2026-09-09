import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="container-page flex flex-col items-center gap-5 py-24 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-ink-300">Hata 404</p>
      <p className="text-7xl font-black tracking-tight">404</p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Aradığın sayfa bulunamadı</h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-400">
        Ürün kaldırılmış veya bağlantı hatalı olabilir. Kategorilere göz atabilir veya arama
        yapabilirsin.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white">
          Anasayfaya dön
        </Link>
        <Link
          href="/arama"
          className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold"
        >
          Ürün ara
        </Link>
        <Link href="/sss" className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold">
          SSS
        </Link>
      </div>
    </div>
  );
}

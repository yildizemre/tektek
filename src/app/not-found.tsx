import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-black tracking-tight">404</p>
      <h1 className="text-2xl font-extrabold">Aradığın sayfa bulunamadı</h1>
      <p className="max-w-sm text-sm text-ink-400">
        Bağlantı taşınmış veya hiç var olmamış olabilir. Anasayfadan devam edebilirsin.
      </p>
      <Link href="/" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
        Anasayfaya dön
      </Link>
    </div>
  );
}

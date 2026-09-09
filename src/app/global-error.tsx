"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#0b0d18] px-6 text-center text-white">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Kritik hata</p>
        <p className="text-7xl font-black tracking-tight">500</p>
        <h1 className="text-2xl font-extrabold">Site geçici olarak kullanılamıyor</h1>
        <p className="max-w-md text-sm text-white/60">
          Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi dene.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#0b0d18]"
        >
          Tekrar dene
        </button>
      </body>
    </html>
  );
}

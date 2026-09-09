import Link from "next/link";
import { XCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ödeme sonucu" };

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const code = typeof query.kod === "string" ? query.kod : "";
  const message = typeof query.mesaj === "string" ? query.mesaj : "";

  return (
    <div className="container-page flex max-w-lg flex-col items-center gap-4 py-24 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-red-50 text-red-500">
        <XCircle className="size-8" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight">Ödeme tamamlanamadı</h1>
      <p className="text-sm text-ink-500">
        {message || "Ödeme işlemi sırasında bir sorun oluştu. Kart bilgilerinizi kontrol edip tekrar deneyin."}
      </p>

      {code && (
        <p className="rounded-2xl bg-ink-50 px-4 py-2 text-sm">
          Sipariş numaranız: <strong>{code}</strong>
        </p>
      )}

      <div className="mt-2 flex gap-3">
        <Link href="/sepet" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
          Sepete dön
        </Link>
        <Link href="/" className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold">
          Anasayfa
        </Link>
      </div>
    </div>
  );
}

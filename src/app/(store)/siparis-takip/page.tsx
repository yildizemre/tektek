import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/format";
import { getOrderByCode } from "@/lib/queries";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş takip" };

const FIELD =
  "w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export default async function OrderTrackingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const code = typeof query.kod === "string" ? query.kod.trim().toUpperCase() : "";
  const email = typeof query.eposta === "string" ? query.eposta.trim().toLowerCase() : "";

  const order = code && email ? await getOrderByCode(code) : null;
  const matched = order && order.email.toLowerCase() === email ? order : null;
  const searched = Boolean(code && email);

  return (
    <div className="container-page max-w-xl space-y-6 py-16">
      <div className="space-y-2 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-ink-50">
          <PackageSearch className="size-6 text-ink-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Sipariş takip</h1>
        <p className="text-sm text-ink-500">
          Sipariş numaranı ve sipariş sırasında kullandığın e-posta adresini gir.
        </p>
      </div>

      <form action="/siparis-takip" className="space-y-3 rounded-3xl border border-ink-100 p-6">
        <input name="kod" defaultValue={code} required placeholder="Sipariş numarası (örn. EN1A2B3CXYZ)" className={FIELD} />
        <input name="eposta" type="email" defaultValue={email} required placeholder="E-posta adresi" className={FIELD} />
        <button type="submit" className="w-full rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white">
          Siparişi sorgula
        </button>
      </form>

      {searched && !matched && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          Bu bilgilerle eşleşen bir sipariş bulunamadı.
        </p>
      )}

      {matched && (
        <div className="space-y-3 rounded-3xl border border-ink-100 p-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold tracking-wider">{matched.code}</span>
            <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white">
              {ORDER_STATUS_LABELS[matched.status] ?? matched.status}
            </span>
          </div>
          <p className="text-sm text-ink-500">Tarih: {formatDate(matched.created_at)}</p>
          <p className="text-sm text-ink-500">Tutar: {formatPrice(matched.total)}</p>
          <Link
            href={`/siparis/${matched.code}`}
            className="mt-2 block rounded-full bg-ink-900 py-3 text-center text-sm font-semibold text-white"
          >
            Sipariş detayını gör
          </Link>
        </div>
      )}
    </div>
  );
}

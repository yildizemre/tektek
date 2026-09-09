import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrdersForUser } from "@/lib/queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Siparişlerim" };

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Siparişlerim</h1>

      {orders.length === 0 ? (
        <p className="rounded-3xl border border-ink-100 p-10 text-center text-sm text-ink-400">
          Henüz siparişin yok.{" "}
          <Link href="/arama" className="font-semibold text-ink-900">Alışverişe başla</Link>
        </p>
      ) : (
        <div className="divide-y divide-ink-50 overflow-hidden rounded-3xl border border-ink-100">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/siparis/${order.code}`}
              className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-ink-50"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold">{order.code}</p>
                <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ORDER_STATUS_TONES[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <span className="text-sm font-bold">{formatPrice(order.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

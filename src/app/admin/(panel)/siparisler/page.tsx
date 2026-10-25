import Link from "next/link";
import { Search } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/format";
import { listOrders } from "@/lib/queries";
import { CodConfirm, needsConfirmation } from "@/components/admin/cod-confirm";
import { canShip, ShipButton } from "@/components/admin/ship-button";
import { ORDER_STATUS_LABELS, orderStatusLabel, orderStatusTone, paymentStatusLabel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Siparişler" };

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tümü" },
  { value: "onay", label: "Onay bekleyen (kapıda)" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const status = typeof query.durum === "string" ? query.durum : "";
  const term = typeof query.q === "string" ? query.q.trim() : "";

  const all = await listOrders({ status: status && status !== "onay" ? status : undefined, search: term || undefined });
  const orders = status === "onay" ? all.filter(needsConfirmation) : all;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Siparişler</h1>
        <p className="text-sm text-ink-400">{orders.length} sipariş listeleniyor.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const params = new URLSearchParams();
            if (filter.value) params.set("durum", filter.value);
            if (term) params.set("q", term);

            return (
              <Link
                key={filter.value || "all"}
                href={`/admin/siparisler${params.toString() ? `?${params}` : ""}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  status === filter.value ? "bg-ink-900 text-white" : "border border-ink-200 hover:bg-white"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <form
          action="/admin/siparisler"
          className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5"
        >
          <Search className="size-4 text-ink-300" />
          <input
            name="q"
            defaultValue={term}
            placeholder="Sipariş no, isim, e-posta..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
        <div className="divide-y divide-ink-50">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-ink-50">
              <Link href={`/admin/siparisler/${order.id}`} className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{order.code}</p>
                  <p className="truncate text-xs text-ink-400">
                    {order.customer_name} · {order.email}
                  </p>
                </div>

                <span className="hidden text-xs text-ink-400 sm:block">{formatDate(order.created_at)}</span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    order.payment_status === "paid"
                      ? "bg-emerald-50 text-emerald-700"
                      : order.payment_status === "failed"
                        ? "bg-red-50 text-red-600"
                        : order.payment_method === "cod"
                          ? "bg-sky-50 text-sky-700"
                          : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {paymentStatusLabel(order)}
                </span>

                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${orderStatusTone(order)}`}>
                  {orderStatusLabel(order)}
                </span>

                <span className="w-24 text-right text-sm font-bold">{formatPrice(order.total)}</span>
              </Link>

              {needsConfirmation(order) && <CodConfirm order={order} items={[]} compact />}
              {canShip(order) && <ShipButton id={order.id} />}
            </div>
          ))}

          {orders.length === 0 && (
            <p className="px-4 py-16 text-center text-sm text-ink-400">Sipariş bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  );
}

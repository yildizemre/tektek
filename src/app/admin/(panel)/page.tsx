import Link from "next/link";
import { AlertTriangle, CreditCard, Package, ShoppingCart, Tags, TrendingUp } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/format";
import { getDashboardStats, getRecentOrders } from "@/lib/queries";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Genel bakış" };

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  const cards = [
    { label: "Toplam ciro", value: formatPrice(stats.revenue), icon: TrendingUp },
    { label: "Ödenen sipariş", value: String(stats.paidOrders), icon: CreditCard },
    { label: "Toplam sipariş", value: String(stats.orders), icon: ShoppingCart },
    { label: "Ürün", value: String(stats.products), icon: Package },
    { label: "Kategori", value: String(stats.categories), icon: Tags },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Genel bakış</h1>
        <p className="text-sm text-ink-400">Mağazanın güncel durumu.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-ink-100 bg-white p-5">
            <card.icon className="size-5 text-brand-600" />
            <p className="mt-4 text-2xl font-extrabold tracking-tight">{card.value}</p>
            <p className="text-xs text-ink-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-ink-100 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-sm font-bold">Son siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs font-semibold text-brand-600">
              Tümünü gör
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">Henüz sipariş yok.</p>
          ) : (
            <div className="divide-y divide-ink-50">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/siparisler/${order.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{order.code}</p>
                    <p className="truncate text-xs text-ink-400">
                      {order.customer_name} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      order.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : order.payment_status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-ink-100 bg-white">
          <div className="flex items-center gap-2 border-b border-ink-100 px-5 py-4">
            <AlertTriangle className="size-4 text-amber-500" />
            <h2 className="text-sm font-bold">Stok azalanlar</h2>
          </div>

          {stats.lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">Stok sorunu yok.</p>
          ) : (
            <div className="divide-y divide-ink-50">
              {stats.lowStock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/urunler/${product.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50"
                >
                  <span className="line-clamp-1 flex-1 text-sm font-medium">{product.name}</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    {product.stock} adet
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

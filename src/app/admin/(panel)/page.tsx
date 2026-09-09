import Link from "next/link";
import { AlertTriangle, Eye, ShoppingCart, TrendingUp, Users } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/format";
import { getAnalytics, getLowStockProducts, getRecentOrders } from "@/lib/queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analiz" };

export default async function AdminDashboardPage() {
  const [stats, orders, lowStock] = await Promise.all([
    getAnalytics(),
    getRecentOrders(),
    getLowStockProducts(),
  ]);

  const cards = [
    { label: "Bugün ziyaretçi", value: String(stats.visitorsToday), hint: `${stats.viewsToday} görüntüleme`, icon: Eye },
    { label: "7 gün ziyaretçi", value: String(stats.visitors7), hint: `${stats.views7} görüntüleme`, icon: Users },
    { label: "30 gün ciro", value: formatPrice(stats.revenue30), hint: `${stats.orders30} sipariş`, icon: TrendingUp },
    { label: "Toplam ciro", value: formatPrice(stats.revenueTotal), hint: `${stats.paidOrders} ödenen`, icon: ShoppingCart },
  ];

  const maxViews = Math.max(...stats.daily.map((day) => day.views), 1);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Analiz</h1>
        <p className="text-sm text-ink-400">
          {stats.customers} üye · {stats.products} ürün · dönüşüm %{stats.conversion}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-ink-100 bg-white p-5">
            <card.icon className="size-5 text-primary" />
            <p className="mt-4 text-2xl font-extrabold tracking-tight">{card.value}</p>
            <p className="text-xs font-semibold text-ink-500">{card.label}</p>
            <p className="text-xs text-ink-400">{card.hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-ink-100 bg-white p-5">
        <h2 className="text-sm font-bold">Son 30 gün trafik</h2>
        <div className="mt-4 flex h-28 items-end gap-1">
          {stats.daily.map((day) => (
            <div
              key={day.day}
              title={`${day.day}: ${day.views} görüntüleme`}
              className="flex-1 rounded-t bg-primary/70"
              style={{ height: `${Math.max(6, (day.views / maxViews) * 100)}%` }}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-ink-100 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-sm font-bold">Son siparişler</h2>
            <Link href="/admin/siparisler" className="text-xs font-semibold text-primary">Tümü</Link>
          </div>
          {orders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">Henüz sipariş yok.</p>
          ) : (
            <div className="divide-y divide-ink-50">
              {orders.map((order) => (
                <Link key={order.id} href={`/admin/siparisler/${order.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{order.code}</p>
                    <p className="truncate text-xs text-ink-400">{order.customer_name} · {formatDate(order.created_at)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ORDER_STATUS_TONES[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
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
          {lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-400">Stok sorunu yok.</p>
          ) : (
            lowStock.map((product) => (
              <Link key={product.id} href={`/admin/urunler/${product.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50">
                <span className="line-clamp-1 flex-1 text-sm font-medium">{product.name}</span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{product.stock} adet</span>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

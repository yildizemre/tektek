import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Landmark, Package } from "lucide-react";

import { ClearCart } from "@/components/clear-cart";
import { Media } from "@/components/media";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderByCode, getOrderItems, getSettings } from "@/lib/queries";
import { ORDER_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş detayı" };

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByCode(code.toUpperCase());
  if (!order) notFound();

  const [items, settings] = await Promise.all([getOrderItems(order.id), getSettings()]);
  const paid = order.payment_status === "paid";

  return (
    <div className="container-page max-w-3xl space-y-8 py-12">
      <ClearCart />

      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`grid size-16 place-items-center rounded-full ${
            paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {paid ? <CheckCircle2 className="size-8" /> : <Clock className="size-8" />}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight">
          {paid ? "Siparişin alındı!" : "Siparişin oluşturuldu"}
        </h1>
        <p className="max-w-md text-sm text-ink-500">
          {paid
            ? "Ödemen başarıyla tamamlandı. Sipariş detaylarını e-posta adresine gönderdik."
            : "Ödeme henüz tamamlanmadı. Aşağıdaki bilgileri kullanarak havale/EFT ile ödeyebilir veya bizimle iletişime geçebilirsin."}
        </p>

        <div className="mt-2 rounded-2xl bg-ink-50 px-5 py-3">
          <span className="text-xs text-ink-400">Sipariş numarası</span>
          <p className="text-lg font-extrabold tracking-wider">{order.code}</p>
        </div>
      </div>

      {!paid && (
        <div className="flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <Landmark className="size-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Havale / EFT ile ödeme</p>
            <p>
              Toplam tutarı gönderdikten sonra dekontu {settings.support_email} adresine iletebilir ya da{" "}
              {settings.support_phone} numarasından bize ulaşabilirsin. Açıklama kısmına sipariş numaranı yazmayı unutma.
            </p>
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-3xl border border-ink-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Package className="size-4" /> Sipariş içeriği
          </h2>
          <span className="rounded-full bg-ink-900 px-3 py-1 text-xs font-semibold text-white">
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>

        <div className="divide-y divide-ink-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl">
                <Media src={item.image_url} alt={item.name} accent="slate" iconClassName="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-ink-400">{item.quantity} adet × {formatPrice(item.price)}</p>
              </div>
              <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>Ara toplam</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Kargo</span>
            <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : "Ücretsiz"}</span>
          </div>
          <div className="flex justify-between border-t border-ink-100 pt-3 text-base font-extrabold">
            <span>Toplam</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-3xl border border-ink-100 p-6 text-sm">
          <h2 className="mb-2 text-sm font-bold">Teslimat bilgileri</h2>
          <p className="font-semibold">{order.customer_name}</p>
          <p className="text-ink-500">{order.address}</p>
          <p className="text-ink-500">{[order.district, order.city].filter(Boolean).join(" / ")}</p>
          <p className="text-ink-500">{order.phone}</p>
          <p className="text-ink-500">{order.email}</p>
        </div>

        <div className="space-y-1 rounded-3xl border border-ink-100 p-6 text-sm">
          <h2 className="mb-2 text-sm font-bold">Sipariş bilgileri</h2>
          <p className="text-ink-500">Tarih: {formatDate(order.created_at)}</p>
          <p className="text-ink-500">
            Ödeme durumu: <strong className="text-ink-900">{paid ? "Ödendi" : "Bekliyor"}</strong>
          </p>
          {order.payment_ref && <p className="text-ink-500">Ödeme referansı: {order.payment_ref}</p>}
          {order.note && <p className="text-ink-500">Not: {order.note}</p>}
        </div>
      </section>

      <div className="flex justify-center gap-3">
        <Link href="/" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
          Alışverişe devam et
        </Link>
        <Link href="/siparis-takip" className="rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold">
          Sipariş takip
        </Link>
      </div>
    </div>
  );
}

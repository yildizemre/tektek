import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { deleteOrderAction, updateOrderAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Media } from "@/components/media";
import { formatDate, formatPrice } from "@/lib/format";
import { getOrderById, getOrderItems } from "@/lib/queries";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sipariş detayı" };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(Number(id));
  if (!order) notFound();

  const items = await getOrderItems(order.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/siparisler" className="rounded-full p-2 hover:bg-white">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{order.code}</h1>
            <p className="text-sm text-ink-400">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <DeleteButton
          id={order.id}
          action={deleteOrderAction}
          confirmText={`${order.code} numaralı sipariş silinsin mi?`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">Sipariş içeriği</h2>

          <div className="divide-y divide-ink-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl">
                  <Media src={item.image_url} alt={item.name} accent="slate" iconClassName="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-ink-400">
                    {item.quantity} adet × {formatPrice(item.price)}
                  </p>
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

        <div className="space-y-6">
          <section className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-bold">Durum</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Ödeme</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  order.payment_status === "paid"
                    ? "bg-emerald-50 text-emerald-700"
                    : order.payment_status === "failed"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
              </span>
            </div>

            {order.payment_ref && (
              <p className="text-xs text-ink-400">iyzico referansı: {order.payment_ref}</p>
            )}
            {order.payment_error && (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">{order.payment_error}</p>
            )}

            <form action={updateOrderAction} className="space-y-2 pt-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm">
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select name="payment_status" defaultValue={order.payment_status} className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm">
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input name="carrier" defaultValue={order.carrier} placeholder="Kargo firması" className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm" />
              <input name="tracking_number" defaultValue={order.tracking_number} placeholder="Takip no" className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm" />
              <textarea name="admin_note" defaultValue={order.admin_note} placeholder="İç not" className="w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm" />
              <button type="submit" className="w-full rounded-full bg-ink-900 py-3 text-sm font-bold text-white">
                Siparişi güncelle
              </button>
            </form>
            {order.phone && (
              <a
                href={`https://wa.me/${order.phone.replace(/\D/g, "").replace(/^0/, "90")}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-full bg-[#25D366] py-3 text-center text-sm font-bold text-white"
              >
                WhatsApp ile yaz
              </a>
            )}
          </section>

          <section className="space-y-1 rounded-3xl border border-ink-100 bg-white p-6 text-sm">
            <h2 className="mb-2 text-sm font-bold">Müşteri</h2>
            <p className="font-semibold">{order.customer_name}</p>
            <p className="text-ink-500">{order.email}</p>
            <p className="text-ink-500">{order.phone}</p>
            {order.identity_number && <p className="text-ink-500">TCKN: {order.identity_number}</p>}

            <h3 className="mb-2 mt-4 text-sm font-bold">Adres</h3>
            <p className="text-ink-500">{order.address}</p>
            <p className="text-ink-500">
              {[order.district, order.city, order.zip_code].filter(Boolean).join(" / ")}
            </p>

            {order.note && (
              <>
                <h3 className="mb-2 mt-4 text-sm font-bold">Sipariş notu</h3>
                <p className="text-ink-500">{order.note}</p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

import { Check, MessageCircle, X } from "lucide-react";

import { confirmOrderAction, rejectOrderAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export function needsConfirmation(order: Pick<Order, "status" | "payment_method" | "confirmation">) {
  return order.payment_method === "cod" && order.status === "pending" && order.confirmation === "pending";
}

export function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0/, "");
  const number = digits.startsWith("90") ? digits : `90${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Müşteriye gönderilecek hazır onay mesajı. */
export function confirmationMessage(order: Order, items: Pick<OrderItem, "name" | "quantity">[]): string {
  const lines = items.map((item) => `• ${item.quantity} x ${item.name}`).join("\n");
  return [
    `Merhaba ${order.customer_name.split(" ")[0]}, Tek Teknoloji'den yazıyoruz.`,
    `${order.code} numaralı kapıda ödeme siparişiniz bize ulaştı:`,
    lines,
    `Toplam: ${formatPrice(order.total)} (kapıda nakit)`,
    `Adres: ${order.address} ${[order.district, order.city].filter(Boolean).join(" / ")}`,
    ``,
    `Siparişinizi onaylıyor musunuz? "Evet" yazmanız yeterli, hemen kargoya hazırlayalım.`,
  ].join("\n");
}

export function CodConfirm({ order, items, compact = false }: { order: Order; items: Pick<OrderItem, "name" | "quantity">[]; compact?: boolean }) {
  const link = whatsappLink(order.phone, confirmationMessage(order, items));

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          title="WhatsApp ile onay iste"
          className="grid size-7 place-items-center rounded-full bg-[#25D366] text-white"
        >
          <MessageCircle className="size-3.5" />
        </a>
        <form action={confirmOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <button className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700">
            <Check className="size-3.5" /> Onayla
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-900">Kapıda ödeme · müşteri onayı bekleniyor</p>
      <p className="text-xs text-amber-800">
        Sahte / iade riskini azaltmak için müşteriyi arayın veya WhatsApp&apos;tan onay isteyin. Onaylanınca kargoya verebilirsiniz.
      </p>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-2.5 text-sm font-bold text-white"
      >
        <MessageCircle className="size-4" /> WhatsApp ile onay iste
      </a>
      <a
        href={`tel:${order.phone.replace(/\s/g, "")}`}
        className="block rounded-full border border-amber-300 bg-white py-2.5 text-center text-sm font-bold text-amber-900"
      >
        Ara: {order.phone}
      </a>
      <div className="grid grid-cols-2 gap-2">
        <form action={confirmOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <button className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
            <Check className="size-4" /> Onaylandı
          </button>
        </form>
        <form action={rejectOrderAction}>
          <input type="hidden" name="id" value={order.id} />
          <button className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 bg-white py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
            <X className="size-4" /> İptal et
          </button>
        </form>
      </div>
    </div>
  );
}

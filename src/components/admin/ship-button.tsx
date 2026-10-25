import { Truck } from "lucide-react";

import { markOrderShippedAction } from "@/app/admin/actions";
import type { Order } from "@/lib/types";

/** Kargoya verilebilir mi? Ödenmiş, hazırlanan veya kapıda ödemeli bekleyen siparişler. */
export function canShip(order: Pick<Order, "status" | "payment_status" | "payment_method">) {
  if (order.status === "paid" || order.status === "preparing") return true;
  if (order.status === "pending") return order.payment_method === "cod" || order.payment_status === "paid";
  return false;
}

export function ShipButton({ id, block = false }: { id: number; block?: boolean }) {
  return (
    <form action={markOrderShippedAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={`flex items-center justify-center gap-1.5 rounded-full bg-indigo-600 font-bold text-white transition hover:bg-indigo-700 ${
          block ? "w-full py-3 text-sm" : "px-3 py-1.5 text-[11px]"
        }`}
      >
        <Truck className={block ? "size-4" : "size-3.5"} />
        Kargoya verildi
      </button>
    </form>
  );
}

import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";

import { deleteCartLeadAction, setCartLeadStatusAction } from "@/app/admin/actions";
import { whatsappLink } from "@/components/admin/cod-confirm";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatDate, formatPrice } from "@/lib/format";
import { listCartLeads } from "@/lib/queries";
import type { CartLead, CartLeadItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sepeti terk edenler" };

const FILTERS = [
  { value: "open", label: "Aranacak" },
  { value: "contacted", label: "Ulaşıldı" },
  { value: "converted", label: "Siparişe döndü" },
  { value: "", label: "Tümü" },
];

const STATUS_LABEL: Record<string, string> = {
  open: "Aranacak",
  contacted: "Ulaşıldı",
  converted: "Siparişe döndü",
};

function parseItems(lead: CartLead): CartLeadItem[] {
  try {
    const parsed = JSON.parse(lead.items);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function reminder(lead: CartLead, items: CartLeadItem[]): string {
  const first = items[0]?.name ?? "ürünler";
  const more = items.length > 1 ? ` ve ${items.length - 1} ürün daha` : "";
  return [
    `Merhaba${lead.name ? ` ${lead.name.split(" ")[0]}` : ""}, Tek Teknoloji'den yazıyoruz.`,
    `Sepetinizde ${first}${more} bekliyor (${formatPrice(lead.total)}).`,
    `Siparişinizi tamamlarken bir sorun mu yaşadınız? Yardımcı olmaktan memnuniyet duyarız; isterseniz siparişinizi buradan da alabiliriz.`,
  ].join("\n");
}

export default async function CartLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const status = typeof query.durum === "string" ? query.durum : "open";
  const leads = await listCartLeads(status || undefined);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Sepeti terk edenler</h1>
        <p className="text-sm text-ink-400">
          Ödeme sayfasında telefonunu yazıp siparişi tamamlamayan ziyaretçiler. Sipariş verirlerse otomatik olarak listeden düşer.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value || "all"}
            href={filter.value === "open" ? "/admin/sepetler" : `/admin/sepetler?durum=${filter.value}`}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              status === filter.value ? "bg-ink-900 text-white" : "border border-ink-200 hover:bg-white"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="divide-y divide-ink-50 overflow-hidden rounded-3xl border border-ink-100 bg-white">
        {leads.map((lead) => {
          const items = parseItems(lead);
          return (
            <div key={lead.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-bold">
                  {lead.name || "İsimsiz"} · <span className="font-semibold text-ink-500">{lead.phone}</span>
                </p>
                <p className="text-xs text-ink-400">
                  {[lead.email, lead.city, formatDate(lead.updated_at)].filter(Boolean).join(" · ")}
                </p>
                <ul className="pt-1 text-xs text-ink-600">
                  {items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      {item.quantity} × {item.name} — {formatPrice(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-extrabold">{formatPrice(lead.total)}</span>
                <span className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-semibold text-ink-600">
                  {STATUS_LABEL[lead.status] ?? lead.status}
                  {lead.order_code ? ` · ${lead.order_code}` : ""}
                </span>

                {lead.status !== "converted" && (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <a
                      href={whatsappLink(lead.phone, reminder(lead, items))}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${lead.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-bold"
                    >
                      <Phone className="size-3.5" /> Ara
                    </a>
                    <form action={setCartLeadStatusAction}>
                      <input type="hidden" name="id" value={lead.id} />
                      <input type="hidden" name="status" value={lead.status === "open" ? "contacted" : "open"} />
                      <button className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-bold hover:bg-ink-50">
                        {lead.status === "open" ? "Ulaşıldı işaretle" : "Tekrar aranacak"}
                      </button>
                    </form>
                    <DeleteButton id={lead.id} action={deleteCartLeadAction} confirmText="Bu kayıt silinsin mi?" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {leads.length === 0 && <p className="px-4 py-16 text-center text-sm text-ink-400">Kayıt yok.</p>}
      </div>
    </div>
  );
}

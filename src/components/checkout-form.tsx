"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, Banknote, CreditCard, Loader2, Lock, ShoppingBag } from "lucide-react";

import { TR_CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/format";
import { COD_FEE } from "@/lib/types";

import { useCart } from "./cart-context";
import { Media } from "./media";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export function CheckoutForm({
  iyzicoEnabled,
  customer,
}: {
  iyzicoEnabled: boolean;
  customer?: { name: string; email: string; phone: string; address: string; city: string; district: string };
}) {
  const { lines, subtotal, ready, clear } = useCart();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const cod = paymentMethod === "cod";
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const leadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (leadTimer.current) clearTimeout(leadTimer.current);
  }, []);

  /** Telefon yazıldıysa sepeti "terk edilen sepet" olarak kaydet (sipariş tamamlanınca kapanır). */
  function saveLead() {
    if (leadTimer.current) clearTimeout(leadTimer.current);
    leadTimer.current = setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      const data = new FormData(form);
      const phone = String(data.get("phone") ?? "");
      if (phone.replace(/D/g, "").length < 10 || lines.length === 0) return;
      void fetch("/api/cart-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          token: leadToken(),
          name: data.get("name"),
          phone,
          email: data.get("email"),
          city: data.get("city"),
          items: lines.map((line) => ({ name: line.name, quantity: line.quantity, price: line.price, slug: line.slug })),
        }),
      }).catch(() => {});
    }, 800);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const data = new FormData(event.currentTarget);
    const payload = {
      customer: {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
        identityNumber: String(data.get("identityNumber") ?? ""),
        address: String(data.get("address") ?? ""),
        city: String(data.get("city") ?? ""),
        district: String(data.get("district") ?? ""),
        zipCode: String(data.get("zipCode") ?? ""),
        note: String(data.get("note") ?? ""),
      },
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        variantId: line.variantId,
      })),
      couponCode: String(data.get("couponCode") ?? ""),
      paymentMethod,
      leadToken: leadToken(),
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        mode?: string;
        redirectUrl?: string;
      };

      if (!result.ok || !result.redirectUrl) {
        setError(result.error ?? "Ödeme başlatılamadı, lütfen tekrar deneyin.");
        setPending(false);
        return;
      }

      if (result.mode === "manual") clear();

      if (result.redirectUrl.startsWith("http")) {
        window.location.href = result.redirectUrl;
      } else {
        router.push(result.redirectUrl);
      }
    } catch {
      setError("Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.");
      setPending(false);
    }
  }

  if (!ready) {
    return <div className="container-page py-20 text-center text-sm text-ink-400">Yükleniyor...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
        <div className="grid size-20 place-items-center rounded-full bg-ink-50">
          <ShoppingBag className="size-8 text-ink-300" />
        </div>
        <h1 className="text-2xl font-extrabold">Ödeme yapılacak ürün yok</h1>
        <Link href="/arama" className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white">
          Alışverişe başla
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onChange={saveLead}
      className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]"
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Ödeme</h1>

        <section className="space-y-4 rounded-3xl border border-ink-100 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">İletişim bilgileri</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required defaultValue={customer?.name} placeholder="Ad Soyad *" className={FIELD} autoComplete="name" />
            <input name="email" type="email" required defaultValue={customer?.email} placeholder="E-posta *" className={FIELD} autoComplete="email" />
            <input name="phone" required defaultValue={customer?.phone} placeholder="Telefon * (5xx xxx xx xx)" className={FIELD} autoComplete="tel" />
            <input name="identityNumber" placeholder="TC Kimlik No (fatura için)" className={FIELD} inputMode="numeric" />
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-ink-100 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">Teslimat adresi</h2>
          <textarea
            name="address"
            required
            rows={3}
            placeholder="Mahalle, cadde, sokak, kapı no *"
            className={FIELD}
            autoComplete="street-address"
            defaultValue={customer?.address}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select name="city" required defaultValue={customer?.city || ""} className={FIELD}>
              <option value="" disabled>İl seçin *</option>
              {TR_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <input name="district" defaultValue={customer?.district} placeholder="İlçe" className={FIELD} />
            <input name="zipCode" placeholder="Posta kodu" className={FIELD} inputMode="numeric" />
          </div>
          <textarea name="note" rows={2} placeholder="Sipariş notu (opsiyonel)" className={FIELD} />
          <input name="couponCode" placeholder="İndirim / referans kodu" className={FIELD} />
        </section>

        <section className="space-y-3 rounded-3xl border border-ink-100 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-400">Ödeme yöntemi</h2>
          {[
            {
              value: "online" as const,
              icon: CreditCard,
              title: iyzicoEnabled ? "Kredi / Banka Kartı" : "Havale / EFT",
              text: iyzicoEnabled ? "iyzico güvenli ödeme sayfasında kartınla öde." : "Ödeme talimatı sipariş sayfasında gösterilir.",
            },
            {
              value: "cod" as const,
              icon: Banknote,
              title: "Kapıda Nakit Ödeme",
              text: `Sadece nakit geçerlidir, kapıda kartla ödeme yapılamaz. +${formatPrice(COD_FEE)} kargo hizmet bedeli eklenir.`,
            },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${
                paymentMethod === option.value ? "border-ink-900 bg-ink-50" : "border-ink-200 hover:border-ink-400"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={() => setPaymentMethod(option.value)}
                className="size-4 accent-ink-900"
              />
              <option.icon className="size-6 shrink-0" />
              <span>
                <span className="block text-sm font-bold">{option.title}</span>
                <span className="block text-xs text-ink-500">{option.text}</span>
              </span>
            </label>
          ))}
        </section>

        {cod && (
          <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <Banknote className="size-5 shrink-0" />
            <p>
              <strong>Kapıda yalnızca nakit ödeme kabul edilir.</strong> Kapıda kredi kartı veya POS ile ödeme
              yapılamaz. Bu seçenekte siparişine <strong>{formatPrice(COD_FEE)} kargo hizmet bedeli</strong> eklenir.
            </p>
          </div>
        )}

        {!iyzicoEnabled && !cod && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="size-5 shrink-0" />
            <p>
              iyzico anahtarları tanımlı değil. Siparişiniz <strong>havale/EFT</strong> olarak kaydedilecek ve
              ödeme talimatı sipariş sayfasında gösterilecek.
            </p>
          </div>
        )}

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-3xl border border-ink-100 p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Sipariş özeti</h2>

        <div className="space-y-3">
          {lines.map((line) => (
            <div key={line.productId} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                <Media
                  src={line.image}
                  alt={line.name}
                  accent={line.accent}
                  icon={line.icon}
                  iconClassName="size-5"
                />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink-900 text-[10px] font-bold text-white">
                  {line.quantity}
                </span>
              </div>
              <span className="line-clamp-2 flex-1 text-xs font-medium">{line.name}</span>
              <span className="text-sm font-bold">{formatPrice(line.price * line.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between text-ink-500">
            <span>Ara toplam</span>
            <span className="font-semibold text-ink-900">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Kargo</span>
            <span className="font-semibold text-emerald-600">Ücretsiz</span>
          </div>
          {cod && (
            <div className="flex justify-between text-ink-500">
              <span>Kapıda ödeme kargo hizmet bedeli</span>
              <span className="font-semibold text-ink-900">+{formatPrice(COD_FEE)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-100 pt-3 text-base font-bold">
            <span>Toplam</span>
            <span>{formatPrice(subtotal + (cod ? COD_FEE : 0))}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {pending
            ? "Yönlendiriliyor..."
            : cod
              ? "Siparişi onayla (kapıda ödeme)"
              : iyzicoEnabled
                ? "iyzico ile öde"
                : "Siparişi tamamla"}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          {cod
            ? "Ödemeyi teslimatta kuryeye yalnızca NAKİT olarak yaparsın; kapıda kredi kartı / POS ile ödeme kabul edilmez."
            : <>Ödemeler 256-bit SSL ile şifrelenir ve iyzico altyapısı üzerinden alınır. Kart bilgileriniz
          sitemizde saklanmaz.</>}
        </p>
      </aside>
    </form>
  );
}

/** Bu tarayıcıya ait sabit sepet kimliği; aynı ziyaretçinin kaydı güncellenir, çoğalmaz. */
function leadToken(): string {
  const key = "tt_lead_token";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, created);
    return created;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

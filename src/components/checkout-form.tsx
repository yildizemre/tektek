"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Loader2, Lock, ShoppingBag } from "lucide-react";

import { TR_CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/format";

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
  const router = useRouter();

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
    <form onSubmit={handleSubmit} className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
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

        {!iyzicoEnabled && (
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
          <div className="flex justify-between border-t border-ink-100 pt-3 text-base font-bold">
            <span>Toplam</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {pending ? "Yönlendiriliyor..." : iyzicoEnabled ? "iyzico ile öde" : "Siparişi tamamla"}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          Ödemeler 256-bit SSL ile şifrelenir ve iyzico altyapısı üzerinden alınır. Kart bilgileriniz
          sitemizde saklanmaz.
        </p>
      </aside>
    </form>
  );
}

import Link from "next/link";
import { CreditCard, Headset, PackageCheck, ShieldCheck, Truck, Wallet } from "lucide-react";

import type { CategoryTree } from "@/lib/types";

import { NewsletterForm } from "./newsletter-form";

const BADGES = [
  { icon: Truck, title: "Ücretsiz kargo", text: "Hızlı teslimat" },
  { icon: ShieldCheck, title: "2 yıl garanti", text: "Teknik destek" },
  { icon: PackageCheck, title: "Değişim & iade", text: "7/24 iletişim" },
  { icon: CreditCard, title: "Taksit imkanı", text: "Tüm bankalara 4 taksit" },
  { icon: Wallet, title: "Kapıda ödeme", text: "Nakit veya kredi kartı" },
  { icon: Headset, title: "Havale & EFT", text: "%5 indirim imkanı" },
];

export function SiteFooter({
  categories,
  settings,
}: {
  categories: CategoryTree[];
  settings: Record<string, string>;
}) {
  return (
    <footer className="mt-20 border-t border-ink-100 bg-ink-50">
      <div className="container-page grid gap-4 border-b border-ink-100 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {BADGES.map((badge) => (
          <div key={badge.title} className="flex items-center gap-3">
            <badge.icon className="size-6 shrink-0 text-brand-600" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-bold">{badge.title}</p>
              <p className="text-xs text-ink-400">{badge.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-black text-white">
              E
            </span>
            {settings.site_name}
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-ink-400">{settings.footer_text}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold">Kategoriler</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-400">
            {categories.slice(0, 7).map((category) => (
              <li key={category.id}>
                <Link href={`/kategori/${category.slug}`} className="hover:text-ink-900">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold">Yardım</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-400">
            <li><Link href="/sayfa/hakkimizda" className="hover:text-ink-900">Hakkımızda</Link></li>
            <li><Link href="/sayfa/iletisim" className="hover:text-ink-900">İletişim</Link></li>
            <li><Link href="/siparis-takip" className="hover:text-ink-900">Sipariş takip</Link></li>
            <li><Link href="/sayfa/teslimat-ve-kargo" className="hover:text-ink-900">Teslimat ve kargo</Link></li>
            <li><Link href="/sayfa/iptal-iade" className="hover:text-ink-900">İptal, iade ve değişim</Link></li>
            <li><Link href="/sayfa/gizlilik" className="hover:text-ink-900">Gizlilik bildirimi</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold">Neden abone olmalısın?</h3>
          <p className="text-sm leading-relaxed text-ink-400">
            Sana özel hazırladığımız kampanya ve fırsatları kaçırmamak için hemen kayıt ol.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-ink-100">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()}, {settings.site_name}. Tüm hakları saklıdır.</span>
          <span>
            Ödeme altyapısı <strong className="font-semibold text-ink-600">iyzico</strong> ile güvence altındadır.
          </span>
        </div>
      </div>
    </footer>
  );
}

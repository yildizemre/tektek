"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgePercent,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tags,
  Users,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import type { SessionPayload } from "@/lib/session";

const NAV = [
  { href: "/admin", label: "Analiz", icon: LayoutDashboard, exact: true },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: Tags },
  { href: "/admin/kampanyalar", label: "Kampanya & kupon", icon: BadgePercent },
  { href: "/admin/yorumlar", label: "Yorumlar", icon: MessageSquare },
  { href: "/admin/uyeler", label: "Üyeler", icon: Users },
  { href: "/admin/icerik", label: "Sayfalar & SSS", icon: FileText },
  { href: "/admin/gorunum", label: "Görünüm", icon: Palette },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
              active ? "bg-white text-ink-900 shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-[#f4f5f8]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col bg-[#111318] p-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-3 text-white">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary text-sm font-black text-primary-fg">
            T
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold">Tek Teknoloji</p>
            <p className="text-[11px] text-white/45">Yönetim paneli</p>
          </div>
        </Link>

        <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="size-4" />
            Mağazayı gör
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Kapat" className="absolute inset-0 bg-ink-900/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#111318] p-5">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-extrabold">Yönetim</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-72">
        <header className="flex items-center gap-3 border-b border-ink-100 bg-white px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-ink-50">
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-extrabold">Tek Teknoloji</span>
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

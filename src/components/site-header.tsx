"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import type { CategoryTree } from "@/lib/types";

import { useCart } from "./cart-context";
import { CategoryIcon } from "./category-icon";

type Session = { name: string; role: "admin" | "user" } | null;

type Props = {
  categories: CategoryTree[];
  announcements: string[];
  session: Session;
  logoText: string;
  logoUrl: string;
  supportPhone: string;
  announcementSpeed: string;
  announcementsEnabled: boolean;
};

export function SiteHeader({
  categories,
  announcements,
  session,
  logoText,
  logoUrl,
  supportPhone,
  announcementSpeed,
  announcementsEnabled,
}: Props) {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  /** Small grace period so the pointer can travel from the tab into the panel. */
  function hoverOpen(id: number) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(id);
  }

  function hoverClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 380);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(query ? `/arama?q=${encodeURIComponent(query)}` : "/arama");
  }

  const activeCategory = categories.find((category) => category.id === openMenu);

  return (
    <header className="sticky top-0 z-50 bg-header text-header-fg">
      {announcementsEnabled && announcements.length > 0 && (
        <div className="pause-on-hover overflow-hidden bg-ann py-2 text-ann-fg">
          <div
            className="flex w-max animate-marquee gap-12 whitespace-nowrap text-xs font-semibold"
            style={{ ["--marquee-duration" as string]: `${announcementSpeed || 32}s` }}
          >
            {[...announcements, ...announcements, ...announcements, ...announcements].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      )}

      <div className="container-page flex h-16 items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="-ml-2 rounded-full p-2 transition hover:bg-white/10 lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight">
          {logoUrl ? (
            <Image src={logoUrl} alt={logoText} width={160} height={40} unoptimized className="h-9 w-auto object-contain" />
          ) : (
            <>
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-fg">
                {logoText.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{logoText}</span>
            </>
          )}
        </Link>

        <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-lg lg:block">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 transition focus-within:bg-white/20">
            <Search className="size-4 opacity-60" />
            <input
              name="q"
              placeholder="Ürün, kategori veya marka ara..."
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="rounded-full p-2 transition hover:bg-white/10 lg:hidden"
            aria-label="Ara"
          >
            <Search className="size-5" />
          </button>

          {supportPhone && (
            <a
              href={`tel:${supportPhone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-white/10 xl:flex"
            >
              <Phone className="size-4" />
              {supportPhone}
            </a>
          )}

          {session ? (
            <Link
              href={session.role === "admin" ? "/admin" : "/hesap"}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-white/10 sm:flex"
            >
              {session.role === "admin" ? <LayoutDashboard className="size-4" /> : <User className="size-4" />}
              <span className="max-w-24 truncate">{session.role === "admin" ? "Yönetim" : session.name.split(" ")[0] || "Hesabım"}</span>
            </Link>
          ) : (
            <Link
              href="/giris"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-white/10 sm:flex"
            >
              <LogIn className="size-4" />
              Giriş yap
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-ink-900 transition hover:opacity-90"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Sepet</span>
            {count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-fg">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="container-page pb-3 lg:hidden">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5">
            <Search className="size-4 opacity-60" />
            <input
              name="q"
              autoFocus
              placeholder="Ne aramıştınız?"
              className="w-full bg-transparent text-sm outline-none placeholder:opacity-50"
            />
          </div>
        </form>
      )}

      {/* Masaüstü kategori menüsü */}
      <nav
        className="relative hidden border-t border-white/10 lg:block"
        onMouseLeave={hoverClose}
        onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
      >
        <div className="container-page flex items-center gap-1 overflow-x-auto py-1 text-sm font-semibold no-scrollbar">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              onMouseEnter={() => hoverOpen(category.id)}
              onFocus={() => hoverOpen(category.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-2 transition ${
                openMenu === category.id ? "bg-white/15" : "opacity-85 hover:opacity-100"
              }`}
            >
              {category.name}
              {category.children.length > 0 && <ChevronDown className="size-3.5" />}
            </Link>
          ))}
        </div>

        {activeCategory && activeCategory.children.length > 0 && (
          <div
            className="absolute inset-x-0 top-full z-40 -mt-1 pt-3"
            onMouseEnter={() => hoverOpen(activeCategory.id)}
          >
            <div className="border-t border-ink-100 bg-white text-ink-900 shadow-2xl">
            <div className="container-page grid gap-6 py-6 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid grid-cols-2 gap-1 xl:grid-cols-3">
                {activeCategory.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/kategori/${child.slug}`}
                    onClick={() => setOpenMenu(null)}
                    className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                  >
                    {child.name}
                    <ChevronRight className="size-4 opacity-0 transition group-hover:opacity-60" />
                  </Link>
                ))}
              </div>

              <Link
                href={`/kategori/${activeCategory.slug}`}
                onClick={() => setOpenMenu(null)}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-ink-50 p-5 transition hover:bg-ink-100"
              >
                {activeCategory.image_url ? (
                  <Image
                    src={activeCategory.image_url}
                    alt={activeCategory.name}
                    fill
                    unoptimized
                    className="absolute inset-0 object-cover opacity-25"
                  />
                ) : null}
                <CategoryIcon name={activeCategory.icon} className="relative size-8 text-primary" />
                <div className="relative mt-6">
                  <p className="text-sm font-bold">{activeCategory.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-400">{activeCategory.description}</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-primary">
                    Tümünü görüntüle →
                  </span>
                </div>
              </Link>
            </div>
            </div>
          </div>
        )}
      </nav>

      {mobileOpen && (
        <MobileMenu
          categories={categories}
          session={session}
          supportPhone={supportPhone}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </header>
  );
}

function MobileMenu({
  categories,
  session,
  supportPhone,
  onClose,
}: {
  categories: CategoryTree[];
  session: Session;
  supportPhone: string;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white text-ink-900">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <span className="text-base font-bold">Kategoriler</span>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-ink-50">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {categories.map((category) => (
            <div key={category.id} className="border-b border-ink-50 last:border-0">
              <div className="flex items-center">
                <Link
                  href={`/kategori/${category.slug}`}
                  onClick={onClose}
                  className="flex flex-1 items-center gap-3 px-3 py-3 text-sm font-semibold"
                >
                  <CategoryIcon name={category.icon} className="size-5 text-primary" />
                  {category.name}
                </Link>

                {category.children.length > 0 && (
                  <button
                    type="button"
                    aria-label="Alt kategoriler"
                    onClick={() => setExpanded(expanded === category.id ? null : category.id)}
                    className="rounded-full p-2 hover:bg-ink-50"
                  >
                    <ChevronDown
                      className={`size-4 transition ${expanded === category.id ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>

              {expanded === category.id && (
                <div className="pb-2 pl-11">
                  {category.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/kategori/${child.slug}`}
                      onClick={onClose}
                      className="block rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-50"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-ink-100 p-4">
          <Link
            href={session ? (session.role === "admin" ? "/admin" : "/hesap") : "/giris"}
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
          >
            <User className="size-4" />
            {session ? (session.role === "admin" ? "Yönetim paneli" : "Hesabım") : "Giriş yap / Üye ol"}
          </Link>

          <Link
            href="/siparis-takip"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-3 text-sm font-semibold"
          >
            <Package className="size-4" />
            Sipariş takip
          </Link>

          {supportPhone && (
            <a
              href={`tel:${supportPhone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-3 text-sm font-semibold"
            >
              <Phone className="size-4" />
              {supportPhone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

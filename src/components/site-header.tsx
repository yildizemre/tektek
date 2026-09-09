"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import type { CategoryTree } from "@/lib/types";

import { useCart } from "./cart-context";
import { CategoryIcon } from "./category-icon";

type Props = {
  categories: CategoryTree[];
  siteName: string;
  announcements: string[];
};

export function SiteHeader({ categories, siteName, announcements }: Props) {
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(query ? `/arama?q=${encodeURIComponent(query)}` : "/arama");
  }

  return (
    <header className="sticky top-0 z-50 bg-ink-900 text-white">
      {announcements.length > 0 && (
        <div className="overflow-hidden border-b border-white/10 py-2">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs font-medium text-white/80">
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
          className="rounded-full p-2 transition hover:bg-white/10 lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-black">
            E
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <form onSubmit={submitSearch} className="mx-auto hidden w-full max-w-md lg:block">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 transition focus-within:bg-white/15">
            <Search className="size-4 text-white/60" />
            <input
              name="q"
              placeholder="Ürün, kategori veya marka ara..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/50"
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

          <Link
            href="/siparis-takip"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10 sm:flex"
          >
            <User className="size-4" />
            Sipariş takip
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-brand-100"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Sepet</span>
            {count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="container-page pb-3 lg:hidden">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Search className="size-4 text-white/60" />
            <input
              name="q"
              autoFocus
              placeholder="Ne aramıştınız?"
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/50"
            />
          </div>
        </form>
      )}

      {/* Desktop category navigation */}
      <nav
        className="relative hidden border-t border-white/10 lg:block"
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2.5 text-sm font-semibold">
          {categories.map((category) => (
            <div key={category.id} onMouseEnter={() => setOpenMenu(category.id)}>
              <Link
                href={`/kategori/${category.slug}`}
                className="flex items-center gap-1 rounded-full px-2 py-1.5 text-white/85 transition hover:text-white"
              >
                {category.name}
                {category.children.length > 0 && <ChevronDown className="size-3.5" />}
              </Link>
            </div>
          ))}
        </div>

        {categories.map(
          (category) =>
            openMenu === category.id &&
            category.children.length > 0 && (
              <div
                key={`panel-${category.id}`}
                className="absolute inset-x-0 top-full border-t border-ink-100 bg-white text-ink-900 shadow-xl"
                onMouseEnter={() => setOpenMenu(category.id)}
              >
                <div className="container-page grid gap-6 py-6 md:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/kategori/${child.slug}`}
                        onClick={() => setOpenMenu(null)}
                        className="rounded-xl px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={`/kategori/${category.slug}`}
                    onClick={() => setOpenMenu(null)}
                    className="flex flex-col justify-between rounded-2xl bg-ink-50 p-5 transition hover:bg-ink-100"
                  >
                    <CategoryIcon name={category.icon} className="size-8 text-brand-600" />
                    <div className="mt-6">
                      <p className="text-sm font-bold">{category.name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-ink-400">{category.description}</p>
                      <span className="mt-3 inline-block text-xs font-semibold text-brand-600">
                        Tümünü görüntüle →
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            ),
        )}
      </nav>

      {mobileOpen && (
        <MobileMenu categories={categories} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  );
}

function MobileMenu({
  categories,
  onClose,
}: {
  categories: CategoryTree[];
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

      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white text-ink-900">
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
                  <CategoryIcon name={category.icon} className="size-5 text-brand-600" />
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

        <div className="border-t border-ink-100 p-4">
          <Link
            href="/siparis-takip"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
          >
            <User className="size-4" />
            Sipariş takip
          </Link>
        </div>
      </div>
    </div>
  );
}

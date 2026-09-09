import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import type { Category, MenuLink, Slide } from "@/lib/types";

import { NewsletterForm } from "./newsletter-form";

function BrandIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

type Props = {
  settings: Record<string, string>;
  categories: Category[];
  links: MenuLink[];
  slides: Slide[];
};

const SOCIALS = [
  {
    key: "social_instagram",
    label: "Instagram",
    path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 1.8H7A2.2 2.2 0 0 0 4.8 7v10A2.2 2.2 0 0 0 7 19.2h10a2.2 2.2 0 0 0 2.2-2.2V7A2.2 2.2 0 0 0 17 4.8zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.6A2.2 2.2 0 1 0 14.2 12 2.2 2.2 0 0 0 12 9.8zm4.35-3.05a.95.95 0 1 1-.95.95.95.95 0 0 1 .95-.95z",
  },
  {
    key: "social_youtube",
    label: "YouTube",
    path: "M23 12.2s0-3.2-.4-4.6c-.22-.86-.88-1.53-1.74-1.75C19.3 5.4 12 5.4 12 5.4s-7.3 0-8.86.45c-.86.22-1.52.89-1.74 1.75C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.22.86.88 1.53 1.74 1.75C4.7 19 12 19 12 19s7.3 0 8.86-.45c.86-.22 1.52-.89 1.74-1.75.4-1.4.4-4.6.4-4.6zM9.75 15.3V9.1l6.1 3.1-6.1 3.1z",
  },
  {
    key: "social_tiktok",
    label: "TikTok",
    path: "M14.5 3h2.1c.2 1.7 1.4 3.2 3 3.9v2.2a6.3 6.3 0 0 1-3.1-.9v6.6A5.8 5.8 0 1 1 9.2 8.9v2.3a3.5 3.5 0 1 0 2.5 3.4V3z",
  },
  {
    key: "social_facebook",
    label: "Facebook",
    path: "M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z",
  },
  {
    key: "social_x",
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.833L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
] as const;

export function SiteFooter({ settings, categories, links, slides }: Props) {
  const columns = [
    { title: settings.footer_col1_title ?? "Kurumsal", items: links.filter((link) => link.section === "footer1") },
    { title: settings.footer_col2_title ?? "Müşteri Hizmetleri", items: links.filter((link) => link.section === "footer2") },
    { title: settings.footer_col3_title ?? "Yardım", items: links.filter((link) => link.section === "footer3") },
  ];

  const socials = SOCIALS.filter((social) => (settings[social.key] ?? "").trim());
  const showSlider = settings.show_footer_slider !== "0" && slides.length > 0;

  return (
    <footer className="mt-20 bg-footer text-footer-fg">
      {showSlider && <FooterSlider slides={slides} />}

      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div>
          <Link href="/" className="flex items-center gap-2 text-lg font-extrabold">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt={settings.logo_text ?? ""}
                width={160}
                height={40}
                unoptimized
                className="h-9 w-auto object-contain"
              />
            ) : (
              <>
                <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-fg">
                  {(settings.logo_text ?? "T").slice(0, 1).toUpperCase()}
                </span>
                {settings.logo_text ?? "Tek Teknoloji"}
              </>
            )}
          </Link>

          <p className="mt-4 max-w-sm text-sm opacity-70">{settings.footer_text}</p>

          <div className="mt-5 space-y-2 text-sm">
            {settings.support_phone && (
              <a
                href={`tel:${settings.support_phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 font-semibold transition hover:text-primary"
              >
                <Phone className="size-4 text-primary" />
                {settings.support_phone}
              </a>
            )}
            {settings.support_email && (
              <a
                href={`mailto:${settings.support_email}`}
                className="flex items-center gap-2 opacity-70 transition hover:text-primary hover:opacity-100"
              >
                <Mail className="size-4 text-primary" />
                {settings.support_email}
              </a>
            )}
            {settings.address_text && (
              <p className="flex items-start gap-2 opacity-70">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                {settings.address_text}
              </p>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map(({ key, label, path }) => (
                <a
                  key={key}
                  href={settings[key]}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full border border-current/15 bg-white/60 text-ink-600 transition hover:bg-primary hover:text-primary-fg"
                >
                  <BrandIcon path={path} className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-bold">{column.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm opacity-70">
              {column.items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="transition hover:text-primary hover:opacity-100">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page border-t border-current/10 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-bold">{settings.footer_newsletter_title}</p>
            <p className="mt-2 max-w-md text-sm opacity-70">{settings.footer_newsletter_text}</p>
            <div className="mt-4 max-w-md">
              <NewsletterForm />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold">Popüler kategoriler</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.slice(0, 14).map((category) => (
                <Link
                  key={category.id}
                  href={`/kategori/${category.slug}`}
                  className="rounded-full border border-current/15 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-primary hover:text-primary-fg"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-current/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.site_name ?? "Tek Teknoloji"}. Tüm hakları saklıdır.
          </p>
          <p>{settings.footer_bottom_text}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterSlider({ slides }: { slides: Slide[] }) {
  const loop = [...slides, ...slides, ...slides, ...slides].slice(0, Math.max(8, slides.length * 2));

  return (
    <div className="pause-on-hover overflow-hidden border-b border-current/10 py-8">
      <div className="flex w-max animate-marquee-slow gap-4">
        {loop.map((slide, index) => {
          const content = (
            <div className="relative h-32 w-64 overflow-hidden rounded-2xl bg-ink-100 sm:h-40 sm:w-80">
              {slide.image_url ? (
                <Image
                  src={slide.image_url}
                  alt={slide.title || ""}
                  fill
                  unoptimized
                  className="object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center bg-gradient-to-br from-ink-200 to-ink-100 text-xs font-semibold text-ink-500">
                  {slide.title || "Görsel"}
                </div>
              )}

              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent p-3 text-white">
                  {slide.title && <p className="text-sm font-bold">{slide.title}</p>}
                  {slide.subtitle && <p className="text-[11px] opacity-80">{slide.subtitle}</p>}
                </div>
              )}
            </div>
          );

          return slide.link ? (
            <Link key={`${slide.id}-${index}`} href={slide.link} className="shrink-0">
              {content}
            </Link>
          ) : (
            <div key={`${slide.id}-${index}`} className="shrink-0">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

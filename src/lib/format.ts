const currency = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return currency.format(Number(value ?? 0));
}

/** Sunucu (Netlify) UTC çalışır; tarihler her zaman Türkiye saatiyle gösterilir. */
export const SHOP_TIME_ZONE = "Europe/Istanbul";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short", timeZone: SHOP_TIME_ZONE });
const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIME_ZONE });

/** Türkiye saatine göre bugünün (veya `daysAgo` gün öncesinin) tarihi: YYYY-MM-DD. */
export function shopDay(daysAgo = 0): string {
  return dayFormat.format(new Date(Date.now() - daysAgo * 86_400_000));
}

export function formatDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormat.format(date);
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function slugify(value: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o",
    ş: "s", Ş: "s", ü: "u", Ü: "u",
  };

  return value
    .split("")
    .map((char) => map[char] ?? char)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDateShort(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("tr-TR").format(Number(value ?? 0));
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Bir yorumun tüm fotoğrafları (yeni `images` listesi + eski tek `image_url`). */
export function reviewPhotos(review: { image_url?: string | null; images?: string | null }): string[] {
  const list = parseJsonArray(review.images ?? "[]");
  if (review.image_url && !list.includes(review.image_url)) list.unshift(review.image_url);
  return list.filter(Boolean);
}

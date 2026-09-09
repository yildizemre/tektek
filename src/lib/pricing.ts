import type { Campaign, Coupon, Product, ProductTier } from "./types";

export type PricedProduct = {
  price: number;
  listPrice: number | null;
  discountPercent: number | null;
  campaignBadge: string;
};

function withinDateRange(startsAt: string, endsAt: string): boolean {
  const now = Date.now();
  if (startsAt && Date.parse(startsAt) > now) return false;
  if (endsAt && Date.parse(`${endsAt}T23:59:59`) < now) return false;
  return true;
}

export function activeCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter(
    (campaign) => campaign.is_active === 1 && withinDateRange(campaign.starts_at, campaign.ends_at),
  );
}

/** Picks the single best campaign that applies to a product. */
export function campaignFor(
  product: Pick<Product, "id" | "category_id">,
  campaigns: Campaign[],
  categoryIds: number[] = [],
): Campaign | null {
  const applicable = campaigns.filter((campaign) => {
    if (campaign.scope === "all") return true;
    if (campaign.scope === "product") return campaign.target_id === product.id;
    if (campaign.scope === "category") {
      const ids = categoryIds.length > 0 ? categoryIds : [product.category_id ?? -1];
      return campaign.target_id !== null && ids.includes(campaign.target_id);
    }
    return false;
  });

  if (applicable.length === 0) return null;
  return applicable.reduce((best, current) =>
    current.discount_percent > best.discount_percent ? current : best,
  );
}

export function priceProduct(
  product: Product,
  campaigns: Campaign[] = [],
  categoryIds: number[] = [],
): PricedProduct {
  const campaign = campaignFor(product, campaigns, categoryIds);
  const base = Number(product.price) || 0;
  const price = campaign ? round(base * (1 - campaign.discount_percent / 100)) : base;

  const listPrice = campaign
    ? Math.max(base, Number(product.compare_at_price ?? 0))
    : (product.compare_at_price ?? null);

  const effectiveList = listPrice && listPrice > price ? listPrice : null;

  return {
    price,
    listPrice: effectiveList,
    discountPercent: effectiveList ? Math.round(((effectiveList - price) / effectiveList) * 100) : null,
    campaignBadge: campaign?.badge || (campaign ? campaign.name : ""),
  };
}

/** "Daha fazla al, az öde": the best tier whose quantity threshold is met. */
export function tierFor(tiers: ProductTier[], quantity: number): ProductTier | null {
  const eligible = tiers
    .filter((tier) => tier.quantity <= quantity && tier.discount_percent > 0)
    .sort((a, b) => b.quantity - a.quantity);

  return eligible[0] ?? null;
}

export function tierUnitPrice(unitPrice: number, tiers: ProductTier[], quantity: number): number {
  const tier = tierFor(tiers, quantity);
  if (!tier) return round(unitPrice);
  return round(unitPrice * (1 - tier.discount_percent / 100));
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string };

export function evaluateCoupon(
  coupon: Coupon | null,
  subtotal: number,
  eligibleSubtotal?: number,
): CouponCheck {
  if (!coupon) return { ok: false, error: "İndirim kodu bulunamadı." };
  if (coupon.is_active !== 1) return { ok: false, error: "Bu indirim kodu artık geçerli değil." };
  if (!withinDateRange(coupon.starts_at, coupon.ends_at))
    return { ok: false, error: "Bu indirim kodunun süresi dolmuş." };
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses)
    return { ok: false, error: "Bu indirim kodu kullanım limitine ulaştı." };
  if (coupon.min_total > 0 && subtotal < coupon.min_total)
    return {
      ok: false,
      error: `Bu kod en az ${coupon.min_total.toFixed(2)} TL tutarındaki sepetlerde geçerli.`,
    };

  const base = eligibleSubtotal ?? subtotal;
  if (base <= 0) return { ok: false, error: "Bu kod sepetinizdeki ürünler için geçerli değil." };

  const raw = coupon.type === "percent" ? (base * coupon.value) / 100 : coupon.value;
  const discount = round(Math.min(raw, subtotal));

  if (discount <= 0) return { ok: false, error: "Bu kod sepetinize indirim uygulamıyor." };
  return { ok: true, coupon, discount };
}

export function round(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

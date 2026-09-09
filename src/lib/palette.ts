/**
 * Accent gradients are stored in the database as a key (so the admin can pick one
 * from a dropdown) and resolved to inline CSS here — Tailwind cannot generate
 * classes for values that only exist at runtime.
 */
export const ACCENTS: Record<string, string> = {
  sky: "linear-gradient(135deg, #bae6fd 0%, #e0e7ff 60%, #ffffff 100%)",
  indigo: "linear-gradient(135deg, #c7d2fe 0%, #ede9fe 60%, #ffffff 100%)",
  violet: "linear-gradient(135deg, #ddd6fe 0%, #fae8ff 60%, #ffffff 100%)",
  fuchsia: "linear-gradient(135deg, #f5d0fe 0%, #fce7f3 60%, #ffffff 100%)",
  rose: "linear-gradient(135deg, #fecdd3 0%, #ffe4e6 60%, #ffffff 100%)",
  orange: "linear-gradient(135deg, #fed7aa 0%, #ffedd5 60%, #ffffff 100%)",
  amber: "linear-gradient(135deg, #fde68a 0%, #fef3c7 60%, #ffffff 100%)",
  lime: "linear-gradient(135deg, #d9f99d 0%, #ecfccb 60%, #ffffff 100%)",
  emerald: "linear-gradient(135deg, #a7f3d0 0%, #d1fae5 60%, #ffffff 100%)",
  teal: "linear-gradient(135deg, #99f6e4 0%, #ccfbf1 60%, #ffffff 100%)",
  cyan: "linear-gradient(135deg, #a5f3fc 0%, #cffafe 60%, #ffffff 100%)",
  blue: "linear-gradient(135deg, #bfdbfe 0%, #dbeafe 60%, #ffffff 100%)",
  slate: "linear-gradient(135deg, #cbd5e1 0%, #e2e8f0 60%, #ffffff 100%)",
  stone: "linear-gradient(135deg, #d6d3d1 0%, #e7e5e4 60%, #ffffff 100%)",
  red: "linear-gradient(135deg, #fecaca 0%, #fee2e2 60%, #ffffff 100%)",
};

export const ACCENT_KEYS = Object.keys(ACCENTS);

export function accentGradient(key: string | null | undefined): string {
  return ACCENTS[key ?? ""] ?? ACCENTS.slate;
}

export type CategoryStyle = { accent: string; icon: string };

const FALLBACK_STYLE: CategoryStyle = { accent: "slate", icon: "package" };

/**
 * Products usually sit in a sub-category, so the look-up has to cover the whole
 * tree — otherwise every card falls back to grey.
 */
export function categoryStyles(
  categories: { slug: string; accent: string; icon: string }[],
) {
  const map = new Map(
    categories.map((category) => [
      category.slug,
      { accent: category.accent, icon: category.icon } satisfies CategoryStyle,
    ]),
  );

  return (slug: string | null | undefined): CategoryStyle => map.get(slug ?? "") ?? FALLBACK_STYLE;
}

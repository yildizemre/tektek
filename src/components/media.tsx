import { accentGradient } from "@/lib/palette";

import { CategoryIcon } from "./category-icon";

type MediaProps = {
  src?: string | null;
  alt: string;
  accent?: string | null;
  icon?: string | null;
  className?: string;
  iconClassName?: string;
};

/**
 * Products and categories ship without photos, so anything missing an image URL
 * falls back to a branded gradient tile instead of a broken image.
 */
export function Media({ src, alt, accent, icon, className = "", iconClassName = "size-14" }: MediaProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`size-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex size-full items-center justify-center ${className}`}
      style={{ background: accentGradient(accent) }}
    >
      <CategoryIcon name={icon} className={`text-ink-700/50 ${iconClassName}`} />
    </div>
  );
}

import { responsiveImage } from "@/lib/image";
import { accentGradient } from "@/lib/palette";

import { CategoryIcon } from "./category-icon";

type MediaProps = {
  src?: string | null;
  alt: string;
  accent?: string | null;
  icon?: string | null;
  className?: string;
  iconClassName?: string;
  /** contain: görseli kırpmadan tamamını gösterir (ürün fotoğrafları için). */
  fit?: "cover" | "contain";
  /** Görselin ekranda kaplayacağı genişlik; tarayıcı buna göre küçük kopyayı indirir. */
  sizes?: string;
  priority?: boolean;
};

/**
 * Products and categories ship without photos, so anything missing an image URL
 * falls back to a branded gradient tile instead of a broken image.
 */
export function Media({
  src,
  alt,
  accent,
  icon,
  className = "",
  iconClassName = "size-14",
  fit = "cover",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  priority = false,
}: MediaProps) {
  if (src) {
    const image = responsiveImage(src);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={image.srcSet ? sizes : undefined}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={`size-full ${fit === "contain" ? "bg-white object-contain" : "object-cover"} ${className}`}
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

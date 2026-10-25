/**
 * Veritabanındaki (/api/media/…) ve public/ altındaki görselleri Next görsel optimizasyonundan
 * geçirip ekrana uygun genişlikte (webp/avif) sunar. Telefon, 2000px'lik orijinal yerine ~640px indirir.
 */
const WIDTHS = [96, 256, 384, 640, 828, 1080, 1200, 1920];

function optimizable(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("//") && !/\.(svg|gif|ico)(\?|$)/i.test(src);
}

export function optimizedSrc(src: string, width: number): string {
  if (!optimizable(src)) return src;
  const w = WIDTHS.find((item) => item >= width) ?? WIDTHS.at(-1)!;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

export function responsiveImage(src: string, maxWidth = 1200): { src: string; srcSet?: string } {
  if (!optimizable(src)) return { src };
  const widths = WIDTHS.filter((item) => item <= maxWidth);
  return {
    src: optimizedSrc(src, maxWidth),
    srcSet: widths.map((w) => `${optimizedSrc(src, w)} ${w}w`).join(", "),
  };
}

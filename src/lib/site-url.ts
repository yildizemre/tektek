/** Netlify sits behind a proxy, so trust the forwarded headers before the raw URL. */
export function baseUrlFrom(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL;
  if (configured) return configured.replace(/\/$/, "");

  const headers = request.headers;
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  if (host) return `${proto}://${host}`;
  return new URL(request.url).origin;
}

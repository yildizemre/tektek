export function publicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "https://tekteknoloji.com").replace(
    /\/$/,
    "",
  );
}

export function absoluteUrl(path = "/") {
  const base = publicSiteUrl();
  if (!path || path === "/") return base;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

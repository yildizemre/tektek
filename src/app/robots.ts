import type { MetadataRoute } from "next";

import { publicSiteUrl } from "@/lib/site";

function siteUrl() {
  return publicSiteUrl();
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/hesap", "/odeme"] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

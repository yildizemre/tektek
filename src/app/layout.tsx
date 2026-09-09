import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { JsonLd } from "@/components/json-ld";
import { getSettings } from "@/lib/queries";
import { absoluteUrl, publicSiteUrl } from "@/lib/site";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => ({}) as Record<string, string>);
  const siteName = settings.site_name || "Tek Teknoloji";
  const title = settings.seo_title || `${siteName} | ${settings.site_tagline || "Teknoloji ürünleri"}`;
  const description =
    settings.seo_description ||
    "Akıllı saat, kulaklık, projeksiyon, araç aksesuarları ve daha fazlası. 2 yıl garanti, ücretsiz kargo ve hızlı teslimat.";
  const ogImage = settings.seo_og_image || settings.logo_url || undefined;

  return {
    metadataBase: new URL(publicSiteUrl()),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords: (settings.seo_keywords || "").split(",").map((item) => item.trim()).filter(Boolean),
    applicationName: siteName,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      locale: "tr_TR",
      url: publicSiteUrl(),
      images: ogImage ? [{ url: ogImage, alt: siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    icons: settings.favicon_url
      ? { icon: settings.favicon_url, apple: settings.favicon_url }
      : undefined,
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => ({}) as Record<string, string>);
  const siteName = settings.site_name || "Tek Teknoloji";

  return (
    <html lang="tr">
      <body className={`${manrope.variable} antialiased`}>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: publicSiteUrl(),
              logo: settings.logo_url || undefined,
              email: settings.support_email || undefined,
              telephone: settings.support_phone || undefined,
              sameAs: [
                settings.social_instagram,
                settings.social_youtube,
                settings.social_tiktok,
                settings.social_facebook,
                settings.social_x,
              ].filter(Boolean),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: publicSiteUrl(),
              potentialAction: {
                "@type": "SearchAction",
                target: `${absoluteUrl("/arama")}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]}
        />
        {children}
      </body>
    </html>
  );
}

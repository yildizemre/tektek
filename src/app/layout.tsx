import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Enteknoloji | Teknolojinin en yenilikçi ürünleri",
    template: "%s | Enteknoloji",
  },
  description:
    "Akıllı saat, kulaklık, projeksiyon, araç aksesuarları ve daha fazlası. 2 yıl garanti, ücretsiz kargo ve hızlı teslimat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}

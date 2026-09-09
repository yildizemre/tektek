import type { Metadata } from "next";

import { Faq } from "@/components/faq";
import { getFaqs, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.section_faq_title || "Sıkça Sorulan Sorular",
    description: "Sipariş, kargo, iade, ödeme ve garanti hakkında en çok sorulan sorular.",
    alternates: { canonical: "/sss" },
  };
}

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);

  return (
    <div className="container-page max-w-3xl space-y-6 py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Yardım</p>
      <h1 className="text-4xl font-extrabold tracking-tight">
        {settings.section_faq_title || "Sıkça Sorulan Sorular"}
      </h1>
      <p className="text-sm leading-relaxed text-ink-500">
        Siparişiniz, kargonuz veya iadenizle ilgili aklınıza takılan her şey. Cevabını burada
        bulamazsanız WhatsApp hattımızdan yazmanız yeterli.
      </p>
      <Faq faqs={faqs} title="Popüler sorular" />
    </div>
  );
}

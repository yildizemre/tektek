import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGES: Record<string, { title: string; body: string[] }> = {
  hakkimizda: {
    title: "Hakkımızda",
    body: [
      "Teknolojinin en son trendlerini takip ediyor ve sizin için en iyi, en yenilikçi ürünleri bir araya getiriyoruz.",
      "5 yılı aşkın sektör tecrübemizle 150.000'den fazla müşteriye ulaştık. Sattığımız her ürün 2 yıl garanti ve kapsamlı servis desteği ile birlikte gelir.",
      "Amacımız teknolojiyi herkes için erişilebilir kılmak: uygun fiyat, hızlı teslimat ve satış sonrasında da yanınızda olan bir destek ekibi.",
    ],
  },
  iletisim: {
    title: "İletişim",
    body: [
      "Sorularınız, sipariş takibiniz veya teknik destek talepleriniz için bize aşağıdaki kanallardan ulaşabilirsiniz.",
      "Hafta içi 09:00 - 18:00 saatleri arasında tüm mesajlarınıza en geç 1 iş günü içinde dönüş yapıyoruz.",
    ],
  },
  "teslimat-ve-kargo": {
    title: "Teslimat ve Kargo",
    body: [
      "Tüm siparişleriniz ücretsiz kargo ile gönderilir.",
      "Siparişler iş günlerinde 24 saat içerisinde kargoya teslim edilir. Teslimat süresi adrese bağlı olarak 1-3 iş günü arasında değişir.",
      "Kargonuz yola çıktığında gönderi kodunuz e-posta ve SMS ile paylaşılır.",
    ],
  },
  "iptal-iade": {
    title: "İptal, İade ve Değişim",
    body: [
      "Ürünü teslim aldığınız tarihten itibaren 14 gün içerisinde, kullanılmamış ve orijinal ambalajında olmak koşuluyla iade edebilirsiniz.",
      "Kargoya verilmemiş siparişlerinizi ücretsiz olarak iptal edebilirsiniz.",
      "Arızalı ürünler 2 yıl garanti kapsamında ücretsiz olarak onarılır veya değiştirilir.",
    ],
  },
  gizlilik: {
    title: "Gizlilik Bildirimi",
    body: [
      "Kişisel verileriniz yalnızca siparişinizin işlenmesi ve size daha iyi hizmet sunulması amacıyla işlenir.",
      "Kart bilgileriniz sitemizde saklanmaz; tüm ödeme işlemleri iyzico altyapısı üzerinden 256-bit SSL ile şifrelenerek gerçekleştirilir.",
      "Alışveriş deneyiminizi iyileştirmek için yasal düzenlemelere uygun çerezler kullanıyoruz.",
    ],
  },
  "satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    body: [
      "İşbu sözleşme, satıcı ile alıcı arasında, alıcının elektronik ortamda sipariş verdiği ürünün satışı ve teslimi ile ilgili tarafların hak ve yükümlülüklerini düzenler.",
      "Alıcı, sipariş vermekle bu sözleşme koşullarını kabul etmiş sayılır.",
      "Cayma hakkı, teslim tarihinden itibaren 14 gündür.",
    ],
  },
};

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return { title: page?.title ?? "Sayfa bulunamadı" };
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();

  const settings = await getSettings();

  return (
    <article className="container-page max-w-3xl space-y-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">{page.title}</h1>

      <div className="space-y-4 text-sm leading-relaxed text-ink-500">
        {page.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {slug === "iletisim" && (
        <div className="grid gap-3 rounded-3xl border border-ink-100 p-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">E-posta</p>
            <p className="font-semibold">{settings.support_email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Telefon</p>
            <p className="font-semibold">{settings.support_phone}</p>
          </div>
        </div>
      )}
    </article>
  );
}

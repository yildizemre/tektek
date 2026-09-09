import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Hangi kargo firmalarıyla çalışıyorsunuz?",
    a: "Tüm gönderilerimizi anlaşmalı kargo firmalarımız üzerinden gerçekleştiriyoruz.",
  },
  {
    q: "Siparişim kaç günde elime ulaşır?",
    a: "Teslimat süreleri kargo firmasına ve adrese göre değişebilir. Genel olarak 1-3 iş günü içerisinde adresinize teslim ediyoruz. (Hafta sonu iş günü kapsamında değildir.)",
  },
  {
    q: "Siparişim ne kadar sürede kargoya verilir?",
    a: "Sipariş verdiğiniz andan itibaren iş günleri içerisinde 24 saat içinde kargo firmasına teslim edilmektedir.",
  },
  {
    q: "Siparişimin takibini nasıl yapabilirim?",
    a: "Sipariş numaranız ile Sipariş Takip sayfasından durumunu görebilir, kargoya verildiğinde gönderdiğimiz e-posta ve SMS'teki gönderi kodunu kullanabilirsiniz.",
  },
  {
    q: "Hangi ödeme yöntemlerini kullanabilirim?",
    a: "Kredi kartı ve banka kartı ile iyzico güvencesinde ödeme yapabilirsiniz. Tüm bankalara taksit imkanı sunulmaktadır.",
  },
];

export function Faq() {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Sıkça Sorulan Sorular</h2>

      <div className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group bg-white px-5 py-4 open:bg-ink-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
              {faq.q}
              <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

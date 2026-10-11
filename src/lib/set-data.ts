export type SetItem = { icon: string; label: string; title: string; text: string };

export type CampaignSet = {
  slug: string;
  name: string;
  subtitle: string;
  banner: string;
  /** Detay sayfasındaki ürün fotoğrafları; yoksa banner gösterilir. */
  gallery?: string[];
  price: number;
  compareAt: number;
  items: SetItem[];
  reasons: { icon: string; text: string }[];
};

/** Ana sayfa slider'ındaki üç set; fiyatlar ilk kurulumdan sonra panelden değiştirilebilir. */
export const CAMPAIGN_SETS: CampaignSet[] = [
  {
    slug: "teknoloji-full-set",
    name: "Teknoloji Full Set",
    subtitle: "Tablet + Kablosuz Kulaklık + Mini Dijital Kamera",
    banner: "/slider/teknoloji-full-set.webp",
    gallery: [1, 2, 3, 4].map((n) => `/sets/teknoloji/${n}.webp`),
    price: 6500,
    compareAt: 8000,
    items: [
      { icon: "tablet", label: "Tablet Seti", title: "Tablet Full Set", text: "Tablet, Bluetooth klavye, mouse, şarj aleti, tablet kalemi ve kapaklı kılıf." },
      { icon: "headphones", label: "Kulaklık", title: "Kablosuz Bluetooth Kulaklık", text: "Şarj kutulu, kablosuz müzik ve görüşme deneyimi." },
      { icon: "camera", label: "Mini Kamera", title: "Mini Dijital Kamera", text: "Eğlenceli tasarımlı, fotoğraf ve video çekimi için mini kamera." },
    ],
    reasons: [
      { icon: "package", text: "3 ürün tek pakette" },
      { icon: "percent", text: "1.500 TL avantaj" },
      { icon: "gift", text: "Zengin kutu içeriği" },
      { icon: "truck", text: "Türkiye geneli teslimat" },
    ],
  },
  {
    slug: "eglence-full-set",
    name: "Eğlence Full Set",
    subtitle: "Drone + Taşınabilir Oyun Konsolu + Yıldız Projektörlü Nemlendirici + Karaoke Hoparlör",
    banner: "/slider/eglence-full-set.webp",
    price: 4500,
    compareAt: 6500,
    items: [
      { icon: "drone", label: "Drone", title: "Kameralı Mini Drone", text: "Katlanabilir gövde, kameralı ve kolay kumandalı keyifli uçuş deneyimi." },
      { icon: "gamepad", label: "Oyun Konsolu", title: "Taşınabilir Oyun Konsolu", text: "Ekranlı el konsolu ve iki adet oyun kolu ile her yerde oyun keyfi." },
      { icon: "star", label: "Nemlendirici", title: "Yıldız Projektörlü Nemlendirici", text: "Rahatlatıcı yıldız ışıkları ve sessiz çalışan hava nemlendirme." },
      { icon: "mic", label: "Karaoke", title: "Karaoke Hoparlör", text: "RGB ışıklı Bluetooth hoparlör ve iki kablosuz mikrofon." },
    ],
    reasons: [
      { icon: "package", text: "4 ürün tek pakette" },
      { icon: "percent", text: "2.000 TL avantaj" },
      { icon: "gift", text: "Zengin kutu içeriği" },
      { icon: "truck", text: "Türkiye geneli teslimat" },
    ],
  },
  {
    slug: "arac-ici-full-set",
    name: "Araç İçi Full Set",
    subtitle: "Araç Kamerası + Şarjlı Süpürge + Akü Takviye & Kompresör + Hızlı Şarj Cihazı",
    banner: "/slider/arac-ici-full-set.webp",
    gallery: [1, 2, 3, 4, 5].map((n) => `/sets/arac/${n}.webp`),
    price: 5500,
    compareAt: 7500,
    items: [
      { icon: "video", label: "Araç Kamerası", title: "Araç İçi Kamera", text: "Vantuzlu montaj, net görüntü ile yolculukta daha fazla güvenlik." },
      { icon: "wind", label: "Süpürge", title: "Şarjlı Araç Süpürgesi", text: "Kablosuz ve güçlü emiş ile daima temiz ve ferah araç." },
      { icon: "zap", label: "Akü Takviye", title: "Akü Takviye & Kompresör", text: "Dijital göstergeli lastik şişirme ve acil durumlar için akü takviye." },
      { icon: "plug", label: "Şarj Cihazı", title: "Araç Hızlı Şarj Cihazı", text: "Dahili kablolu, çoklu çıkışlı ve RGB ışıklı hızlı şarj." },
    ],
    reasons: [
      { icon: "package", text: "4 ürün tek pakette" },
      { icon: "percent", text: "2.000 TL avantaj" },
      { icon: "gift", text: "Zengin kutu içeriği" },
      { icon: "truck", text: "Türkiye geneli teslimat" },
    ],
  },
];

export function getCampaignSet(slug: string) {
  return CAMPAIGN_SETS.find((item) => item.slug === slug) ?? null;
}

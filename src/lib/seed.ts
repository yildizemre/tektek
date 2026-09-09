import type { Client } from "@libsql/client";
import bcrypt from "bcryptjs";

type SeedCategory = {
  name: string;
  slug: string;
  accent: string;
  icon: string;
  description?: string;
  children?: { name: string; slug: string }[];
};

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAt: number;
  reviews: number;
  rating?: number;
  featured?: boolean;
  short: string;
  features?: string[];
  colors?: { name: string; hex: string }[];
};

const CATEGORIES: SeedCategory[] = [
  {
    name: "Akıllı Saat",
    slug: "akilli-saat",
    accent: "sky",
    icon: "watch",
    description: "AMOLED ekran, kalp ritmi ve uyku takibi ile günlük hayatını kolaylaştıran akıllı saatler.",
    children: [
      { name: "Tüm Akıllı Saatler", slug: "tum-akilli-saatler" },
      { name: "Erkek Modelleri", slug: "erkek-modelleri" },
      { name: "Kadın Modelleri", slug: "kadin-modelleri" },
      { name: "Çocuk Modelleri", slug: "cocuk-modelleri" },
    ],
  },
  {
    name: "Kulaklıklar",
    slug: "kulakliklar",
    accent: "emerald",
    icon: "headphones",
    description: "Aktif gürültü engelleme ve uzun pil ömrüyle kablosuz kulaklıklar.",
    children: [
      { name: "Kablosuz Kulaklıklar", slug: "kablosuz-kulakliklar" },
      { name: "Kulak Üstü Kulaklıklar", slug: "kulak-ustu-kulakliklar" },
    ],
  },
  {
    name: "Projeksiyon Cihazları",
    slug: "projeksiyon-cihazlari",
    accent: "amber",
    icon: "projector",
    description: "Evini sinema salonuna çeviren taşınabilir ve ev tipi projeksiyonlar.",
    children: [
      { name: "Taşınabilir Projeksiyon", slug: "tasinabilir-projeksiyon" },
      { name: "Ev Tipi Projeksiyon", slug: "ev-tipi-projeksiyon" },
    ],
  },
  {
    name: "Araç Aksesuarları",
    slug: "arac-aksesuarlari",
    accent: "orange",
    icon: "car",
    description: "Aracın için ihtiyacın olan her şey: süpürge, kompresör, CarPlay ve daha fazlası.",
    children: [
      { name: "Araç Süpürgeleri", slug: "arac-supurgeleri" },
      { name: "Akü Takviye & Kompresör", slug: "aku-takviye-kompresor" },
      { name: "CarPlay Dönüştürücüler", slug: "arac-carplay-donusturucu" },
      { name: "Araç İçi Kameralar", slug: "arac-ici-kameralar" },
      { name: "Araç Yıkama Makineleri", slug: "arac-yikama-makineleri" },
      { name: "Araç Takip Cihazı", slug: "arac-takip-cihazi" },
      { name: "Araç Parfümleri", slug: "arac-parfumleri" },
      { name: "Pixel Ledler", slug: "pixel-ledler" },
    ],
  },
  {
    name: "Oyun Konsolları",
    slug: "oyun-konsollari",
    accent: "fuchsia",
    icon: "gamepad",
    description: "Retro klasiklerden taşınabilir konsollara kadar oyun dünyası.",
  },
  {
    name: "Kameralar",
    slug: "kameralar",
    accent: "blue",
    icon: "camera",
    description: "Güvenlik, aksiyon ve araç kameralarında geniş ürün yelpazesi.",
    children: [
      { name: "Güvenlik Kameraları", slug: "guvenlik-kameralari" },
      { name: "Araç Kameraları", slug: "arac-kameralari" },
      { name: "Aksiyon Kameraları", slug: "aksiyon-kameralari" },
      { name: "Dijital Fotoğraf Makineleri", slug: "dijital-fotograf-makineleri" },
      { name: "Bebek Kameraları", slug: "bebek-kameralari" },
    ],
  },
  {
    name: "Hoparlör",
    slug: "hoparlor",
    accent: "amber",
    icon: "speaker",
    description: "Partiyi taşıyan yüksek sesli bluetooth hoparlörler.",
  },
  {
    name: "Motosiklet Aksesuarları",
    slug: "motosiklet-aksesuarlari",
    accent: "stone",
    icon: "bike",
    description: "Motosiklet tutucular, interkomlar ve yol arkadaşların.",
  },
  {
    name: "Mikrofon",
    slug: "mikrofon",
    accent: "slate",
    icon: "mic",
    description: "İçerik üreticileri için kablosuz yaka ve stüdyo mikrofonları.",
  },
  {
    name: "Hava Nemlendirici",
    slug: "hava-nemlendirici",
    accent: "cyan",
    icon: "droplets",
    description: "Ortam nemini dengeleyen sessiz ultrasonik nemlendiriciler.",
  },
  {
    name: "Akıllı Ürünler",
    slug: "akilli-urunler",
    accent: "lime",
    icon: "cpu",
    description: "Evini akıllandıran robot süpürgeler, prizler ve sensörler.",
  },
  {
    name: "Kampanyalı Setler",
    slug: "kampanyali-setler",
    accent: "red",
    icon: "gift",
    description: "Birlikte al, daha az öde. Avantajlı ürün setleri.",
  },
];

const WATCH_COLORS = [
  { name: "Siyah", hex: "#111827" },
  { name: "Gümüş", hex: "#cbd5e1" },
  { name: "Altın", hex: "#d4af37" },
];

const SOFT_COLORS = [
  { name: "Beyaz", hex: "#f8fafc" },
  { name: "Siyah", hex: "#111827" },
  { name: "Pembe", hex: "#f9a8d4" },
];

const PRODUCTS: SeedProduct[] = [
  { name: "Tekno Watch 11 Pro+ Akıllı Saat", slug: "tekno-watch-11-pro-plus", category: "erkek-modelleri", price: 2199, compareAt: 2599, reviews: 121, rating: 4.9, featured: true, short: "2.1 inç AMOLED ekran, Bluetooth arama ve 7 gün pil ömrü.", features: ["2.1'' AMOLED ekran", "Bluetooth ile arama", "IP68 suya dayanıklılık", "100+ spor modu", "7 güne varan pil"], colors: WATCH_COLORS },
  { name: "Tekno X1 Pro Akıllı Saat", slug: "tekno-x1-pro", category: "erkek-modelleri", price: 2799, compareAt: 3199, reviews: 111, rating: 4.9, featured: true, short: "Paslanmaz çelik kasa, çift kordon ve NFC desteği.", features: ["Paslanmaz çelik kasa", "NFC", "Kalp ritmi & SpO2", "Çift kordon hediyeli"], colors: WATCH_COLORS },
  { name: "Tekno TX-4 Pro Akıllı Saat", slug: "tekno-tx-4-pro", category: "erkek-modelleri", price: 2199, compareAt: 2599, reviews: 154, rating: 4.8, featured: true, short: "Askeri sınıf dayanıklılık, GPS rota takibi.", features: ["Askeri sınıf gövde", "GPS rota kaydı", "Uyku analizi", "Kablosuz şarj"], colors: WATCH_COLORS },
  { name: "Tekno TK 11 Pro Max Akıllı Saat", slug: "tekno-tk-11-pro-max", category: "erkek-modelleri", price: 1999, compareAt: 2499, reviews: 113, rating: 4.8, featured: true, short: "Geniş ekran, özelleştirilebilir 200+ kadran.", features: ["1.96'' ekran", "200+ kadran", "Bluetooth arama", "IP67"], colors: WATCH_COLORS },
  { name: "Tekno TK 11 Ultra 3 Akıllı Saat", slug: "tekno-tk-11-ultra-3", category: "erkek-modelleri", price: 1999, compareAt: 2499, reviews: 112, rating: 4.8, featured: true, short: "Ultra tasarım, çift buton ve aksiyon tuşu.", features: ["Ultra kasa tasarımı", "Aksiyon tuşu", "Pusula & barometre", "Hızlı şarj"], colors: WATCH_COLORS },
  { name: "Tekno Watch 11 Mini Akıllı Saat", slug: "tekno-watch-11-mini", category: "kadin-modelleri", price: 2199, compareAt: 2599, reviews: 83, rating: 4.9, featured: true, short: "İnce kasa, kadın sağlığı takibi ve 3 kordon.", features: ["Hafif ince kasa", "Regl takibi", "3 kordon hediyeli", "Kablosuz şarj"], colors: SOFT_COLORS },
  { name: "Tekno Lady S Akıllı Saat", slug: "tekno-lady-s", category: "kadin-modelleri", price: 1899, compareAt: 2299, reviews: 47, short: "Zarif metal kordon ve altın rengi kasa.", features: ["Metal kordon", "AMOLED ekran", "Stres ölçümü"], colors: SOFT_COLORS },
  { name: "Tekno Kids 4G Max Akıllı Çocuk Saati", slug: "tekno-kids-4g-max", category: "cocuk-modelleri", price: 4499, compareAt: 4999, reviews: 84, rating: 4.9, featured: true, short: "4G görüntülü arama, GPS konum ve güvenli alan uyarısı.", features: ["4G görüntülü görüşme", "GPS + LBS konum", "Güvenli alan bildirimi", "SOS tuşu"], colors: SOFT_COLORS },
  { name: "Tekno Kids 4G Pro Akıllı Çocuk Saati", slug: "tekno-kids-4g-pro", category: "cocuk-modelleri", price: 3799, compareAt: 3899, reviews: 80, rating: 4.8, featured: true, short: "SIM kart destekli, ebeveyn uygulaması ile tam kontrol.", features: ["SIM kart destekli", "Ebeveyn uygulaması", "Ders modu", "Su geçirmez"], colors: SOFT_COLORS },

  { name: "Air 3 Bluetooth Kulaklık", slug: "air-3-bluetooth-kulaklik", category: "kablosuz-kulakliklar", price: 998.77, compareAt: 1199.08, reviews: 106, rating: 4.8, featured: true, short: "Dokunmatik kontrol, 30 saate varan toplam kullanım.", features: ["Bluetooth 5.3", "Dokunmatik kontrol", "30 saat toplam pil", "Şeffaf eşleşme"], colors: SOFT_COLORS },
  { name: "Air Pro 2 ANC Bluetooth Kulaklık", slug: "air-pro-2-anc", category: "kablosuz-kulakliklar", price: 1199.08, compareAt: 1498.85, reviews: 105, rating: 4.9, featured: true, short: "Aktif gürültü engelleme ve şeffaflık modu.", features: ["Aktif gürültü engelleme (ANC)", "Şeffaflık modu", "Kablosuz şarj kutusu", "Çift mikrofon"], colors: SOFT_COLORS },
  { name: "Air 2 Bluetooth Kulaklık", slug: "air-2-bluetooth-kulaklik", category: "kablosuz-kulakliklar", price: 799, compareAt: 899, reviews: 64, short: "Günlük kullanım için hafif ve dengeli ses.", features: ["Hafif tasarım", "Bluetooth 5.2", "Type-C şarj"], colors: SOFT_COLORS },
  { name: "Air Pro ANC Bluetooth Kulaklık", slug: "air-pro-anc", category: "kablosuz-kulakliklar", price: 998.77, compareAt: 1099.16, reviews: 39, short: "Kompakt kutu, güçlü bas ve net konuşma.", features: ["ANC", "Derin bas", "Oyun modu"], colors: SOFT_COLORS },
  { name: "Tekno Studio Kulak Üstü Kulaklık", slug: "tekno-studio-over-ear", category: "kulak-ustu-kulakliklar", price: 1899, compareAt: 2299, reviews: 28, short: "Kulak üstü konfor, 60 saat pil ömrü.", features: ["Kulak üstü", "60 saat pil", "Katlanabilir tasarım"], colors: SOFT_COLORS },

  { name: "Tekno Beam Mini Taşınabilir Projeksiyon", slug: "tekno-beam-mini", category: "tasinabilir-projeksiyon", price: 3499, compareAt: 3999, reviews: 42, short: "Cebe sığan boyut, 120 inç görüntü.", features: ["120'' görüntü", "Dahili batarya", "Wi-Fi yansıtma", "Dahili hoparlör"] },
  { name: "Tekno Beam Go 4K Projeksiyon", slug: "tekno-beam-go-4k", category: "tasinabilir-projeksiyon", price: 5499, compareAt: 6299, reviews: 31, short: "4K destekli, otomatik odak ve keystone.", features: ["4K destek", "Otomatik odak", "Android TV", "Bluetooth ses çıkışı"] },
  { name: "Tekno Cinema 1080p Ev Projeksiyon", slug: "tekno-cinema-1080p", category: "ev-tipi-projeksiyon", price: 6999, compareAt: 7999, reviews: 24, short: "Gerçek Full HD panel, sessiz soğutma.", features: ["Gerçek 1080p", "Sessiz fan", "HDMI / USB", "300'' maksimum görüntü"] },
  { name: "Tekno Cinema Pro 4K Ev Projeksiyon", slug: "tekno-cinema-pro-4k", category: "ev-tipi-projeksiyon", price: 11999, compareAt: 13499, reviews: 17, short: "Ev sineması deneyimi için 4K HDR.", features: ["4K HDR", "Dolby ses", "Motorlu odak", "Akıllı TV arayüzü"] },

  { name: "Tekno Vac Mini Kablosuz Araç Süpürgesi", slug: "tekno-vac-mini", category: "arac-supurgeleri", price: 1299, compareAt: 1599, reviews: 66, short: "16000Pa emiş gücü, kablosuz kullanım.", features: ["16000Pa emiş", "Kablosuz", "HEPA filtre", "Type-C şarj"] },
  { name: "Tekno Vac Pro Araç Süpürgesi", slug: "tekno-vac-pro", category: "arac-supurgeleri", price: 1899, compareAt: 2199, reviews: 38, short: "Metal gövde, 3 farklı başlık.", features: ["Metal gövde", "3 başlık", "Yıkanabilir filtre"] },
  { name: "Tekno Jump 12000mAh Akü Takviye Cihazı", slug: "tekno-jump-12000", category: "aku-takviye-kompresor", price: 2499, compareAt: 2899, reviews: 51, short: "Aracını saniyeler içinde çalıştır, powerbank olarak da kullan.", features: ["12000mAh", "800A anlık akım", "LED fener", "Powerbank özelliği"] },
  { name: "Tekno Air Pump Dijital Hava Kompresörü", slug: "tekno-air-pump", category: "aku-takviye-kompresor", price: 1499, compareAt: 1799, reviews: 44, short: "Dijital basınç ayarı ile otomatik durdurma.", features: ["Dijital ekran", "Otomatik durdurma", "Şarjlı", "Bisiklet/top adaptörü"] },
  { name: "Tekno Link Kablosuz CarPlay Dönüştürücü", slug: "tekno-link-carplay", category: "arac-carplay-donusturucu", price: 2199, compareAt: 2599, reviews: 73, short: "Kablolu CarPlay'i kablosuza çevir, 3 saniyede bağlan.", features: ["Kablosuz CarPlay", "Android Auto", "3 sn bağlantı", "OTA güncelleme"] },
  { name: "Tekno Screen 9'' CarPlay Ekran", slug: "tekno-screen-9", category: "arac-carplay-donusturucu", price: 4299, compareAt: 4899, reviews: 29, short: "Kurulum gerektirmeyen taşınabilir multimedya ekranı.", features: ["9'' dokunmatik", "Kablosuz CarPlay/AA", "Geri görüş desteği", "FM verici"] },
  { name: "Tekno DC-3 Araç İçi Kamera", slug: "tekno-dc-3", category: "arac-ici-kameralar", price: 2799, compareAt: 3199, reviews: 57, short: "Gece görüşlü çift kamera, park modu.", features: ["Çift kamera", "Gece görüşü", "Park modu", "Döngüsel kayıt"] },
  { name: "Tekno Wash Yüksek Basınçlı Yıkama", slug: "tekno-wash", category: "arac-yikama-makineleri", price: 2299, compareAt: 2699, reviews: 35, short: "Şarjlı, hortumsuz araç yıkama çözümü.", features: ["Şarjlı", "6 farklı sprey ucu", "Kova ile çalışır"] },
  { name: "Tekno Track GPS Araç Takip Cihazı", slug: "tekno-track-gps", category: "arac-takip-cihazi", price: 1799, compareAt: 2099, reviews: 22, short: "Anlık konum, hız ve rota geçmişi.", features: ["Anlık konum", "Rota geçmişi", "Mobil uygulama", "Gizli montaj"] },
  { name: "Tekno Aroma Araç Parfümü", slug: "tekno-aroma-parfum", category: "arac-parfumleri", price: 349, compareAt: 449, reviews: 91, short: "Uzun süre kalıcı, metal gövdeli difüzör.", features: ["Metal gövde", "Kalıcı koku", "Yedek kartuş dahil"] },
  { name: "Tekno Pixel LED Ekranlı Araç Paneli", slug: "tekno-pixel-led", category: "pixel-ledler", price: 1499, compareAt: 1799, reviews: 40, short: "Kendi yazını ve animasyonunu yükle.", features: ["Mobil uygulama", "Özel animasyon", "Cam vantuz montaj"] },

  { name: "Tekno Game Box 128GB Retro Oyun Konsolu", slug: "tekno-game-box-128", category: "oyun-konsollari", price: 1999, compareAt: 2399, reviews: 61, short: "10.000+ hazır oyun, çift kumanda.", features: ["10.000+ oyun", "Çift kablosuz kumanda", "HDMI çıkış", "128GB hafıza"] },
  { name: "Tekno Handheld Pro Taşınabilir Konsol", slug: "tekno-handheld-pro", category: "oyun-konsollari", price: 3499, compareAt: 3999, reviews: 33, short: "5 inç IPS ekran, avuç içi oyun keyfi.", features: ["5'' IPS ekran", "Hall efekt analog", "Wi-Fi çok oyunculu", "5000mAh"] },

  { name: "Tekno Cam 360° Wi-Fi Güvenlik Kamerası", slug: "tekno-cam-360", category: "guvenlik-kameralari", price: 1499, compareAt: 1899, reviews: 88, short: "Hareket takibi, çift yönlü konuşma.", features: ["360° dönüş", "Hareket takibi", "Çift yönlü ses", "Gece görüşü"] },
  { name: "Tekno Cam Solar Güneş Enerjili Kamera", slug: "tekno-cam-solar", category: "guvenlik-kameralari", price: 2999, compareAt: 3499, reviews: 46, short: "Kablosuz kurulum, güneş paneli ile sonsuz enerji.", features: ["Güneş paneli", "4G/Wi-Fi", "IP66", "PIR sensör"] },
  { name: "Tekno RC-5 Ön/Arka Araç Kamerası", slug: "tekno-rc-5", category: "arac-kameralari", price: 2499, compareAt: 2899, reviews: 54, short: "Ön ve arka eş zamanlı kayıt.", features: ["Ön + arka kamera", "1080p", "G-sensor", "Geniş açı"] },
  { name: "Tekno Action 5 4K Aksiyon Kamerası", slug: "tekno-action-5", category: "aksiyon-kameralari", price: 3299, compareAt: 3799, reviews: 37, short: "Su altı 30m, elektronik sabitleme.", features: ["4K 60fps", "EIS sabitleme", "30m su geçirmez kutu", "Aksesuar seti"] },
  { name: "Tekno Snap 4K Dijital Fotoğraf Makinesi", slug: "tekno-snap-4k", category: "dijital-fotograf-makineleri", price: 2799, compareAt: 3299, reviews: 26, short: "Vlog için çevrilebilir ekran.", features: ["4K video", "Çevrilebilir ekran", "16x zoom", "Harici mikrofon girişi"] },
  { name: "Tekno Baby Monitor 5'' Bebek Kamerası", slug: "tekno-baby-monitor-5", category: "bebek-kameralari", price: 2399, compareAt: 2799, reviews: 43, short: "İnternetsiz çalışan güvenli bağlantı.", features: ["5'' ekran", "İnternetsiz çalışır", "Ninni modu", "Sıcaklık sensörü"] },

  { name: "Tekno Sound Party 60W Bluetooth Hoparlör", slug: "tekno-sound-party-60w", category: "hoparlor", price: 2799, compareAt: 3299, reviews: 58, short: "RGB ışıklı, partiyi taşıyan güç.", features: ["60W çıkış", "RGB ışık", "TWS eşleştirme", "12 saat pil"] },
  { name: "Tekno Sound Mini Taşınabilir Hoparlör", slug: "tekno-sound-mini", category: "hoparlor", price: 999, compareAt: 1299, reviews: 71, short: "Avuç içi boyut, IPX7 suya dayanıklılık.", features: ["IPX7", "Askı ipi", "10 saat pil"], colors: SOFT_COLORS },

  { name: "Tekno Moto Kask İçi Bluetooth İnterkom", slug: "tekno-moto-interkom", category: "motosiklet-aksesuarlari", price: 1899, compareAt: 2299, reviews: 30, short: "1000m menzil, 6 kişilik grup konuşması.", features: ["1000m menzil", "6 kişi grup", "Su geçirmez", "Sesli komut"] },
  { name: "Tekno Moto Şarjlı Telefon Tutucu", slug: "tekno-moto-tutucu", category: "motosiklet-aksesuarlari", price: 899, compareAt: 1099, reviews: 49, short: "Titreşim emici, kablosuz şarjlı.", features: ["Kablosuz şarj", "Titreşim emici", "Alüminyum gövde"] },

  { name: "Tekno Mic Duo Kablosuz Yaka Mikrofonu", slug: "tekno-mic-duo", category: "mikrofon", price: 1299, compareAt: 1599, reviews: 63, short: "İki verici, gürültü engelleme, şarj kutusu.", features: ["2 verici", "Gürültü engelleme", "Şarj kutusu", "iPhone + Android"], colors: SOFT_COLORS },
  { name: "Tekno Mic Studio USB Mikrofon", slug: "tekno-mic-studio", category: "mikrofon", price: 1899, compareAt: 2299, reviews: 21, short: "Yayıncılar için kondenser mikrofon.", features: ["Kondenser kapsül", "RGB ışık", "Tripod ve pop filtre"] },

  { name: "Tekno Mist 4L Ultrasonik Hava Nemlendirici", slug: "tekno-mist-4l", category: "hava-nemlendirici", price: 1299, compareAt: 1599, reviews: 55, short: "Sessiz çalışma, 30 saat kesintisiz buhar.", features: ["4L hazne", "30 saat çalışma", "Sessiz", "Gece lambası"] },
  { name: "Tekno Mist Mini Masaüstü Nemlendirici", slug: "tekno-mist-mini", category: "hava-nemlendirici", price: 599, compareAt: 799, reviews: 74, short: "Masanda serinlik, USB ile çalışır.", features: ["USB ile çalışır", "Kompakt", "LED ışık"], colors: SOFT_COLORS },

  { name: "Tekno Smart Robot Süpürge", slug: "tekno-smart-robot-supurge", category: "akilli-urunler", price: 6999, compareAt: 7999, reviews: 39, short: "Lazer haritalama ve paspas özelliği.", features: ["Lazer haritalama", "Paspas modu", "Uygulama kontrolü", "Sanal duvar"] },
  { name: "Tekno Smart Akıllı Priz Seti (4'lü)", slug: "tekno-smart-priz-4", category: "akilli-urunler", price: 499, compareAt: 699, reviews: 82, short: "Uzaktan aç/kapa, zamanlayıcı ve tüketim takibi.", features: ["Uygulama kontrolü", "Zamanlayıcı", "Tüketim takibi", "Sesli asistan"] },

  { name: "Akıllı Saat + Kulaklık Kampanya Seti", slug: "saat-kulaklik-seti", category: "kampanyali-setler", price: 2999, compareAt: 3798, reviews: 68, short: "Tekno Watch 11 Pro+ ve Air 3 birlikte.", features: ["Tekno Watch 11 Pro+", "Air 3 Bluetooth Kulaklık", "Tek kutuda hediye paketi"] },
  { name: "Araç Bakım Seti (Süpürge + Kompresör)", slug: "arac-bakim-seti", category: "kampanyali-setler", price: 2599, compareAt: 3398, reviews: 34, short: "Aracının bakımı için ikili avantaj paketi.", features: ["Tekno Vac Mini", "Tekno Air Pump", "Taşıma çantası"] },
];

const REVIEWS = [
  { author: "Gökhan K.", title: "Saat mükemmel", body: "Büyüklük olarak ideal, kullanımı çok akıcı bir ürün. Eşim çok memnun kaldı, teşekkür ederim." },
  { author: "Görkem S.", title: "Süper bayıldım", body: "Eşime evlilik yıldönümü hediyesi olarak aldım, çok beğendi. Fiyatına göre gayet iyi, sorunsuz çalışıyor." },
  { author: "Ebru A.", title: "Müptelası olacaksınız", body: "Tasarım ve uygulama tarafı mükemmel, ayrıca çok estetik. Düşünmeden almanızı tavsiye ederim." },
  { author: "M. Fatih T.", title: "Araştırıp aldım", body: "Birçok özelliğine zaten aşinaydım. Genel hatlarıyla üründen çok memnun kaldığımı söyleyebilirim." },
  { author: "Fatih G.", title: "Güzel ve kaliteli", body: "Bir haftaya yakındır kullanıyorum, çok güzel bir ürün. Malzeme kalitesi de iyi, tavsiye ederim." },
  { author: "Volkan B.", title: "Memnuniyet", body: "Ürünü almadan önce sorduğum her soruya hızla cevap aldım, ürün bir günde bana ulaştı." },
  { author: "Enes K.", title: "Güven ve hız", body: "Almadan önce çok tereddüt etmiştim ama şimdi neden beklediğime kızıyorum. Her şey için teşekkürler." },
  { author: "Emir H.", title: "Maşallah", body: "Çok sağlam bir şekilde elime ulaştı. Satıcıya ayrıca teşekkür ediyorum, bol kazançlar." },
  { author: "Selin Y.", title: "Kargo çok hızlı", body: "Siparişimi verdikten bir gün sonra elimdeydi. Paketleme özenliydi, ürün açıklamadaki gibi." },
  { author: "Burak D.", title: "Fiyat performans", body: "Bu fiyata bu özellikler gerçekten iyi. Pil ömrü beklediğimden uzun çıktı." },
];

const FAQS = [
  { q: "Siparişim ne zaman kargoya verilir?", a: "İş günlerinde saat 16:00'ya kadar verilen siparişler aynı gün, sonrasındakiler bir sonraki iş günü kargoya teslim edilir. Hafta sonu verilen siparişler pazartesi günü yola çıkar." },
  { q: "Kargo ücreti var mı, kaç günde teslim edilir?", a: "Tüm siparişlerde kargo ücretsizdir. Teslimat süresi bulunduğunuz ile göre değişmekle birlikte ortalama 1-3 iş günüdür. Kargonuz yola çıktığında SMS ve e-posta ile bilgilendirilirsiniz." },
  { q: "Siparişimi nasıl takip ederim?", a: "Üye girişi yaptıysanız Hesabım > Siparişlerim sayfasından siparişinizin anlık durumunu görebilirsiniz. Üye değilseniz Sipariş Takip sayfasından sipariş numaranız ve e-posta adresinizle sorgulayabilirsiniz." },
  { q: "Hangi ödeme yöntemlerini kullanabilirim?", a: "Kredi kartı ve banka kartı ile iyzico güvencesinde ödeme yapabilirsiniz. Tüm bankalara taksit imkânı sunulmaktadır. Dilerseniz havale/EFT ile de ödeyebilirsiniz." },
  { q: "Kart bilgilerim güvende mi?", a: "Kesinlikle. Ödeme sayfası tamamen iyzico altyapısı üzerinde çalışır, kart bilgileriniz hiçbir şekilde sitemize iletilmez veya saklanmaz. Tüm trafik 256-bit SSL ile şifrelenir." },
  { q: "Ürünler garantili mi?", a: "Tüm ürünlerimiz 2 yıl resmi garanti ve ek kapsamlı servis garantisi ile gönderilir. Garanti süresi içinde oluşan üretim kaynaklı arızalarda ürününüz ücretsiz onarılır veya değiştirilir." },
  { q: "İade ve değişim nasıl yapılır?", a: "Ürünü teslim aldıktan sonra 14 gün içinde, kullanılmamış ve orijinal ambalajında olması şartıyla iade edebilirsiniz. İade talebinizi WhatsApp veya e-posta ile iletmeniz yeterli, kargo ücretini biz karşılıyoruz." },
  { q: "Faturamı nasıl alırım?", a: "E-arşiv faturanız sipariş kargoya verildiğinde e-posta adresinize otomatik olarak gönderilir. Kurumsal fatura için sipariş notuna vergi dairesi ve numaranızı yazmanız yeterlidir." },
  { q: "Stokta olmayan ürün ne zaman gelir?", a: "Tükenen ürünler genellikle 1-2 hafta içinde yeniden stoklarımıza girer. Ürün sayfasından bize WhatsApp üzerinden yazarsanız stok geldiğinde ilk siz haberdar olursunuz." },
  { q: "İndirim kodumu nerede kullanırım?", a: "Sepetinizi onayladıktan sonra ödeme sayfasındaki 'İndirim kodu' alanına kodunuzu yazıp uygula butonuna basmanız yeterli. İndirim anında toplam tutara yansır." },
];

const PAGES = [
  {
    slug: "hakkimizda",
    title: "Hakkımızda",
    body: `## Tek Teknoloji kimdir?

Tek Teknoloji, teknolojiyi herkes için erişilebilir kılmak amacıyla kurulmuş bir e-ticaret markasıdır. Akıllı saatlerden araç aksesuarlarına, güvenlik kameralarından kablosuz kulaklıklara kadar günlük hayatı kolaylaştıran ürünleri tek çatı altında topluyoruz.

## Neden biz?

- **Seçki:** Yüzlerce ürünü test ediyor, sadece gerçekten işe yarayanları mağazamıza alıyoruz.
- **Garanti:** Tüm ürünlerimiz 2 yıl resmi garanti ve ek kapsamlı servis garantisiyle gelir.
- **Hız:** Siparişler iş günlerinde aynı gün kargoya verilir, ortalama 1-3 iş gününde adresinizdedir.
- **Destek:** Satın alma öncesinde ve sonrasında WhatsApp hattımızdan bize ulaşabilirsiniz.

## Vizyonumuz

Teknolojinin en yeni ürünlerini, en uygun fiyatla ve arkasında duran bir servis anlayışıyla sunmak. Müşterimizin bir kere değil, her ihtiyacında bizi tercih etmesini istiyoruz.

Sorularınız için bize her zaman **+90 533 866 41 38** numaralı WhatsApp hattımızdan yazabilirsiniz.`,
  },
  {
    slug: "iletisim",
    title: "İletişim",
    body: `## Bize ulaşın

Sorularınız, sipariş takibiniz veya teknik destek talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz.

- **WhatsApp / Telefon:** +90 533 866 41 38
- **E-posta:** destek@tekteknoloji.com
- **Çalışma saatleri:** Hafta içi 09:00 – 18:00

WhatsApp üzerinden yazdığınız mesajlara genellikle dakikalar içinde, e-postalara ise en geç 1 iş günü içinde dönüş yapıyoruz.

## Sipariş öncesi danışmanlık

Hangi ürünün size uygun olduğundan emin değil misiniz? WhatsApp hattımızdan yazın, ihtiyacınıza en uygun modeli birlikte belirleyelim.`,
  },
  {
    slug: "teslimat-ve-kargo",
    title: "Teslimat ve Kargo",
    body: `## Kargo ücretsiz

Tutar sınırı olmaksızın tüm siparişlerinizde kargo ücretsizdir.

## Kargoya veriliş süresi

İş günlerinde saat 16:00'ya kadar verilen siparişler aynı gün, sonrasındaki siparişler bir sonraki iş günü kargo firmasına teslim edilir. Hafta sonu ve resmi tatillerde kargo çıkışı yapılmaz.

## Teslimat süresi

Kargonuz, bulunduğunuz ile bağlı olarak ortalama **1-3 iş günü** içerisinde adresinize teslim edilir.

## Kargo takibi

Siparişiniz kargoya verildiğinde gönderi kodunuz SMS ve e-posta ile paylaşılır. Ayrıca üye girişi yaparak Hesabım > Siparişlerim sayfasından da takip edebilirsiniz.

## Teslimat sırasında hasar

Kargo paketinde ezilme, yırtılma veya ıslanma fark ederseniz lütfen teslim almadan önce kargo görevlisine tutanak tutturun ve bizimle iletişime geçin. Hasarlı ürün ücretsiz olarak değiştirilir.`,
  },
  {
    slug: "iptal-iade",
    title: "İptal, İade ve Değişim",
    body: `## Cayma hakkı

Mesafeli Satış Sözleşmesi gereği, ürünü teslim aldığınız tarihten itibaren **14 gün** içinde hiçbir gerekçe göstermeksizin cayma hakkınızı kullanabilirsiniz.

## İade koşulları

- Ürün kullanılmamış, denenmiş olsa dahi yıpranmamış olmalıdır.
- Orijinal kutusu, tüm aksesuarları ve varsa hediye ürünleriyle birlikte gönderilmelidir.
- Fatura iade paketine eklenmelidir.

## Nasıl iade ederim?

1. WhatsApp hattımızdan (+90 533 866 41 38) veya e-posta ile iade talebinizi iletin.
2. Size özel iade kargo kodunu paylaşalım.
3. Ürünü anlaşmalı kargo şubesine teslim edin — **iade kargo ücreti bize aittir.**
4. Ürün elimize ulaşıp kontrol edildikten sonra 1-3 iş günü içinde ücret iadesi başlatılır.

## Sipariş iptali

Henüz kargoya verilmemiş siparişlerinizi ücretsiz olarak iptal edebilirsiniz. Kargoya verilmiş siparişlerde iade süreci işletilir.

## Ücret iadesi ne zaman hesabıma geçer?

İade onayından sonra tutar aynı gün bankanıza iletilir. Kartınıza yansıma süresi bankanıza göre 3-10 iş günü arasında değişebilir.

## Garanti kapsamı

Tüm ürünlerimiz 2 yıl resmi garantilidir. Garanti süresi içindeki üretim kaynaklı arızalarda ürün ücretsiz onarılır veya yenisiyle değiştirilir. Kullanıcı kaynaklı fiziksel hasar ve sıvı teması garanti kapsamı dışındadır.`,
  },
  {
    slug: "gizlilik",
    title: "Gizlilik ve KVKK Bildirimi",
    body: `## Hangi verileri topluyoruz?

Sipariş oluşturabilmeniz için ad soyad, e-posta, telefon ve teslimat adresi bilgilerinizi topluyoruz. Üyelik oluşturursanız bu bilgiler hesabınızda saklanır.

## Verileriniz nerede kullanılıyor?

Toplanan veriler yalnızca siparişinizin hazırlanması, kargolanması, faturalandırılması ve size destek verilmesi amacıyla kullanılır. Üçüncü taraflarla pazarlama amacıyla paylaşılmaz.

## Ödeme güvenliği

Kart bilgileriniz sitemize hiçbir şekilde iletilmez. Ödeme işlemleri tamamen **iyzico** altyapısı üzerinde, 256-bit SSL şifreleme ile gerçekleştirilir.

## Çerezler

Alışveriş sepetinizin korunması ve site deneyiminin iyileştirilmesi için zorunlu çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerezleri dilediğiniz zaman temizleyebilirsiniz.

## Haklarınız

KVKK kapsamında verilerinize erişme, düzeltme ve silinmesini talep etme hakkına sahipsiniz. Talebinizi destek@tekteknoloji.com adresine iletebilirsiniz.`,
  },
  {
    slug: "satis-sozlesmesi",
    title: "Mesafeli Satış Sözleşmesi",
    body: `## 1. Taraflar

İşbu sözleşme, satıcı **Tek Teknoloji** ile elektronik ortamda sipariş veren alıcı arasında düzenlenmiştir.

## 2. Konu

Sözleşmenin konusu, alıcının satıcıya ait internet sitesinden elektronik ortamda sipariş verdiği ürünün satışı ve teslimi ile ilgili tarafların hak ve yükümlülüklerinin belirlenmesidir.

## 3. Ürün bilgileri

Ürünlerin temel özellikleri, satış fiyatı ve ödeme şekli sipariş sayfasında yer almaktadır. Listelenen fiyatlar KDV dahildir.

## 4. Teslimat

Ürün, alıcının sipariş sırasında bildirdiği adrese kargo ile teslim edilir. Teslimat süresi ortalama 1-3 iş günüdür.

## 5. Cayma hakkı

Alıcı, teslim tarihinden itibaren 14 gün içinde cayma hakkını kullanabilir. Cayma hakkının kullanılması durumunda ürünün kutusu, aksesuarları ve faturası eksiksiz iade edilmelidir.

## 6. Yetkili mahkeme

İşbu sözleşmenin uygulanmasında, Ticaret Bakanlığı'nca ilan edilen değere kadar Tüketici Hakem Heyetleri ile alıcının veya satıcının yerleşim yerindeki Tüketici Mahkemeleri yetkilidir.`,
  },
  {
    slug: "kullanici-sozlesmesi",
    title: "Kullanıcı Sözleşmesi",
    body: `## Üyelik

Siteye üye olan kullanıcı, verdiği bilgilerin doğru olduğunu kabul eder. Hesap güvenliğinden ve şifresinin gizliliğinden kullanıcı sorumludur.

## Kullanım kuralları

Site içeriği (görseller, metinler, ürün açıklamaları) Tek Teknoloji'ye aittir ve izinsiz kopyalanamaz. Siteye zarar verecek, otomatik istek gönderen veya güvenliği tehdit eden davranışlar yasaktır.

## Yorumlar

Ürün yorumları yayınlanmadan önce moderasyondan geçer. Hakaret, reklam veya kişisel veri içeren yorumlar yayınlanmaz.

## Değişiklikler

Tek Teknoloji, işbu sözleşmede değişiklik yapma hakkını saklı tutar. Güncel sözleşme her zaman bu sayfada yayınlanır.`,
  },
];

const FOOTER_LINKS = [
  { section: "footer1", label: "Hakkımızda", href: "/sayfa/hakkimizda" },
  { section: "footer1", label: "İletişim", href: "/sayfa/iletisim" },
  { section: "footer1", label: "Satış Sözleşmesi", href: "/sayfa/satis-sozlesmesi" },
  { section: "footer1", label: "Kullanıcı Sözleşmesi", href: "/sayfa/kullanici-sozlesmesi" },
  { section: "footer2", label: "Gizlilik Bildirimi", href: "/sayfa/gizlilik" },
  { section: "footer2", label: "Teslimat ve Kargo", href: "/sayfa/teslimat-ve-kargo" },
  { section: "footer2", label: "İptal, İade ve Değişim", href: "/sayfa/iptal-iade" },
  { section: "footer3", label: "Üye Girişi", href: "/giris" },
  { section: "footer3", label: "Siparişlerim", href: "/hesap/siparislerim" },
  { section: "footer3", label: "Sipariş Takip", href: "/siparis-takip" },
  { section: "footer3", label: "Sıkça Sorulan Sorular", href: "/sss" },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  // Kimlik
  site_name: "Tek Teknoloji",
  logo_text: "Tek Teknoloji",
  logo_url: "",
  favicon_url: "",
  site_tagline: "Teknolojinin en yenilikçi ürünleri",

  // Tema
  theme_primary: "#4f46e5",
  theme_primary_text: "#ffffff",
  theme_page_bg: "#ffffff",
  theme_text: "#0b0d18",
  theme_header_bg: "#0b0d18",
  theme_header_text: "#ffffff",
  theme_announcement_bg: "#facc15",
  theme_announcement_text: "#111827",
  theme_footer_bg: "#f6f6f7",
  theme_footer_text: "#0b0d18",
  theme_radius: "24",

  // Duyuru şeridi
  announcements:
    "♻️ 2 yıl garantiye ek kapsamlı servis garantisi|🥰 +220.000 mutlu müşteri|🚚 Ücretsiz kargo ve hızlı teslimat|💳 Tüm bankalara taksit imkânı",
  announcement_speed: "32",
  announcements_enabled: "1",

  // Vitrin
  hero_enabled: "1",
  hero_badge: "Teknolojinin en yenilikçi ürünleri",
  hero_title: "Teknolojiyi hayatının merkezine al",
  hero_subtitle:
    "Akıllı saatlerden araç aksesuarlarına kadar günlük hayatını kolaylaştıran ürünler; 2 yıl garanti, ücretsiz kargo ve 7/24 destek ile.",
  hero_cta_text: "Kampanyaları keşfet",
  hero_cta_link: "/kategori/kampanyali-setler",
  hero_image_url: "",

  // Bölüm başlıkları
  section_categories_title: "Kategoriler",
  section_categories_subtitle: "İhtiyacın olan teknolojiyi kategorilerden keşfet.",
  section_featured_title: "Sizin İçin Seçtiklerimiz",
  section_bestsellers_title: "Çok Satanlar",
  section_new_title: "Yeni Gelenler",
  section_reviews_title: "Sizden Gelenler",
  section_faq_title: "Sıkça Sorulan Sorular",
  show_categories: "1",
  show_featured: "1",
  show_bestsellers: "1",
  show_new: "1",
  show_stats: "1",
  show_reviews: "1",
  show_faq: "1",
  show_footer_slider: "1",

  // İstatistikler
  stat_customers: "+150.000",
  stat_customers_label: "🥳 Mutlu müşteri",
  stat_satisfaction: "%98.7",
  stat_satisfaction_label: "😊 Müşteri memnuniyeti",
  stat_rating: "4.9/5",
  stat_rating_label: "⭐ Ürün değerlendirme puanı",

  // İletişim
  support_phone: "+90 533 866 41 38",
  support_email: "destek@tekteknoloji.com",
  whatsapp_number: "905338664138",
  whatsapp_message: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
  whatsapp_enabled: "1",

  // Sosyal medya
  social_instagram: "",
  social_youtube: "",
  social_tiktok: "",
  social_facebook: "",
  social_x: "",

  // Kargo
  shipping_cost: "0",
  free_shipping_threshold: "0",

  // Footer
  footer_text:
    "Teknolojinin en son trendlerini takip ediyor, sizin için en iyi ve en yenilikçi ürünleri seçiyoruz.",
  footer_col1_title: "Kurumsal",
  footer_col2_title: "Müşteri Hizmetleri",
  footer_col3_title: "Yardım",
  footer_newsletter_title: "Neden abone olmalısın?",
  footer_newsletter_text:
    "Sana özel hazırladığımız kampanya ve fırsatları kaçırmamak için hemen kayıt ol.",
  footer_bottom_text: "Ödeme altyapısı iyzico ile güvence altındadır.",

  // SEO
  seo_title: "Tek Teknoloji | Akıllı saat, kulaklık ve teknoloji ürünleri",
  seo_description:
    "Akıllı saat, kulaklık, projeksiyon, araç aksesuarları ve güvenlik kameraları. 2 yıl garanti, ücretsiz kargo, iyzico ile güvenli ödeme.",
  seo_keywords: "akıllı saat, bluetooth kulaklık, araç aksesuarı, güvenlik kamerası, projeksiyon",
  seo_og_image: "",
};

export async function seedDatabase(client: Client) {
  await seedAdmin(client);
  await seedSettings(client);
  await seedFaqs(client);
  await seedPages(client);
  await seedMenuLinks(client);

  const existing = await client.execute("SELECT COUNT(*) AS c FROM categories");
  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  const categoryIds = new Map<string, number>();

  for (const [index, category] of CATEGORIES.entries()) {
    const result = await client.execute({
      sql: `INSERT INTO categories (name, slug, description, accent, icon, parent_id, sort_order, show_on_home)
            VALUES (?, ?, ?, ?, ?, NULL, ?, 1)`,
      args: [category.name, category.slug, category.description ?? "", category.accent, category.icon, index],
    });
    const parentId = Number(result.lastInsertRowid);
    categoryIds.set(category.slug, parentId);

    for (const [childIndex, child] of (category.children ?? []).entries()) {
      const childResult = await client.execute({
        sql: `INSERT INTO categories (name, slug, description, accent, icon, parent_id, sort_order, show_on_home)
              VALUES (?, ?, '', ?, ?, ?, ?, 0)`,
        args: [child.name, child.slug, category.accent, category.icon, parentId, childIndex],
      });
      categoryIds.set(child.slug, Number(childResult.lastInsertRowid));
    }
  }

  const parentOf = new Map<string, string>();
  for (const category of CATEGORIES) {
    for (const child of category.children ?? []) parentOf.set(child.slug, category.slug);
  }

  for (const [index, product] of PRODUCTS.entries()) {
    const categoryId = categoryIds.get(product.category) ?? null;

    const result = await client.execute({
      sql: `INSERT INTO products
              (name, slug, sku, brand, short_description, description, price, compare_at_price, stock,
               category_id, image_url, gallery, features, rating, review_count, is_active, is_featured, sort_order)
            VALUES (?, ?, ?, 'Tek Teknoloji', ?, ?, ?, ?, ?, ?, '', '[]', ?, ?, ?, 1, ?, ?)`,
      args: [
        product.name,
        product.slug,
        `TT-${1000 + index}`,
        product.short,
        buildDescription(product),
        product.price,
        product.compareAt,
        50,
        categoryId,
        JSON.stringify(product.features ?? []),
        product.rating ?? 4.7,
        product.reviews,
        product.featured ? 1 : 0,
        index,
      ],
    });

    const productId = Number(result.lastInsertRowid);

    // Ana kategori + üst kategori ilişkisi
    const linked = new Set<number>();
    if (categoryId) linked.add(categoryId);
    const parentSlug = parentOf.get(product.category);
    if (parentSlug && categoryIds.has(parentSlug)) linked.add(categoryIds.get(parentSlug)!);

    for (const id of linked) {
      await client.execute({
        sql: "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)",
        args: [productId, id],
      });
    }

    for (const [colorIndex, color] of (product.colors ?? []).entries()) {
      await client.execute({
        sql: `INSERT INTO product_variants (product_id, name, color_hex, image_url, price_diff, stock, sort_order)
              VALUES (?, ?, ?, '', 0, 20, ?)`,
        args: [productId, color.name, color.hex, colorIndex],
      });
    }

    await client.execute({
      sql: `INSERT INTO product_tiers (product_id, quantity, discount_percent, badge, sort_order)
            VALUES (?, 2, 10, 'En Avantajlı', 1)`,
      args: [productId],
    });
    await client.execute({
      sql: `INSERT INTO product_tiers (product_id, quantity, discount_percent, badge, sort_order)
            VALUES (?, 3, 15, 'Süper Fırsat', 2)`,
      args: [productId],
    });
  }

  const productIds = await client.execute("SELECT id FROM products ORDER BY id LIMIT 12");

  for (const [index, review] of REVIEWS.entries()) {
    const target = productIds.rows[index % productIds.rows.length] as unknown as { id: number };
    await client.execute({
      sql: `INSERT INTO reviews (product_id, author, rating, title, body, is_featured, is_approved)
            VALUES (?, ?, 5, ?, ?, 1, 1)`,
      args: [Number(target.id), review.author, review.title, review.body],
    });
  }

  await client.execute({
    sql: `INSERT INTO coupons (code, description, type, value, min_total, is_active)
          VALUES ('HOSGELDIN', 'İlk siparişe özel %10 indirim', 'percent', 10, 0, 1)`,
  });
}

function buildDescription(product: SeedProduct): string {
  const features = (product.features ?? []).map((item) => `- ${item}`).join("\n");

  return `${product.short}

## Öne çıkan özellikler

${features}

## Kutu içeriği

- 1 x ${product.name}
- 1 x Type-C şarj kablosu
- 1 x Türkçe kullanım kılavuzu
- 2 yıl garanti belgesi

## Neden Tek Teknoloji'den almalısınız?

Ürün orijinal kutusunda, tüm aksesuarlarıyla birlikte gönderilir. Siparişiniz iş günlerinde aynı gün kargoya verilir ve ortalama 1-3 iş günü içinde adresinizde olur. Satın alma sonrasında da WhatsApp hattımızdan bize ulaşabilir, kurulum ve kullanım desteği alabilirsiniz.`;
}

async function seedAdmin(client: Client) {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) return;

  const existing = await client.execute("SELECT id, email FROM admin_users ORDER BY id LIMIT 1");
  const first = existing.rows[0] as unknown as { id: number; email: string } | undefined;
  if (first && first.email === email) return;

  const hash = await bcrypt.hash(password, 10);

  if (first) {
    await client.execute({
      sql: "UPDATE admin_users SET email = ?, password_hash = ? WHERE id = ?",
      args: [email, hash, first.id],
    });
    return;
  }

  await client.execute({
    sql: "INSERT INTO admin_users (email, name, password_hash, role) VALUES (?, ?, ?, 'owner')",
    args: [email, "Yönetici", hash],
  });
}

async function seedSettings(client: Client) {
  const existing = await client.execute("SELECT COUNT(*) AS c FROM settings");
  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
      args: [key, value],
    });
  }
}

async function seedFaqs(client: Client) {
  const existing = await client.execute("SELECT COUNT(*) AS c FROM faqs");
  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  for (const [index, faq] of FAQS.entries()) {
    await client.execute({
      sql: "INSERT INTO faqs (question, answer, sort_order, is_active) VALUES (?, ?, ?, 1)",
      args: [faq.q, faq.a, index],
    });
  }
}

async function seedPages(client: Client) {
  const existing = await client.execute("SELECT COUNT(*) AS c FROM pages");
  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  for (const [index, page] of PAGES.entries()) {
    await client.execute({
      sql: `INSERT INTO pages (slug, title, body, seo_title, seo_description, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
      args: [
        page.slug,
        page.title,
        page.body,
        `${page.title} | Tek Teknoloji`,
        page.body.replace(/[#*\-\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160),
        index,
      ],
    });
  }
}

async function seedMenuLinks(client: Client) {
  const existing = await client.execute("SELECT COUNT(*) AS c FROM menu_links");
  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  for (const [index, link] of FOOTER_LINKS.entries()) {
    await client.execute({
      sql: "INSERT INTO menu_links (section, label, href, sort_order, is_active) VALUES (?, ?, ?, ?, 1)",
      args: [link.section, link.label, link.href, index],
    });
  }
}

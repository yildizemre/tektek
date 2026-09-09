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
};

const CATEGORIES: SeedCategory[] = [
  {
    name: "Akıllı Saat",
    slug: "akilli-saat",
    accent: "sky",
    icon: "watch",
    description: "Amoled ekran, kalp ritmi ve uyku takibi ile günlük hayatını kolaylaştıran akıllı saatler.",
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
  },
  {
    name: "Projeksiyon Cihazları",
    slug: "projeksiyon-cihazlari",
    accent: "amber",
    icon: "projector",
    description: "Evini sinema salonuna çeviren taşınabilir ve ev tipi projeksiyonlar.",
    children: [
      { name: "Taşınabilir Projeksiyon Cihazları", slug: "tasinabilir-projeksiyon" },
      { name: "Ev Tipi Projeksiyon Cihazları", slug: "ev-tipi-projeksiyon" },
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
      { name: "Akü Takviyeleri & Hava Kompresörleri", slug: "aku-takviye-kompresor" },
      { name: "Araç Carplay Dönüştürücüler", slug: "arac-carplay-donusturucu" },
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

const PRODUCTS: SeedProduct[] = [
  // Akıllı saat
  { name: "Harvox Watch 11 Pro+ Akıllı Saat", slug: "harvox-watch-11-pro-plus", category: "erkek-modelleri", price: 2199, compareAt: 2599, reviews: 121, rating: 4.9, featured: true, short: "2.1 inç AMOLED ekran, Bluetooth arama ve 7 gün pil ömrü.", features: ["2.1'' AMOLED ekran", "Bluetooth ile arama", "IP68 suya dayanıklılık", "100+ spor modu", "7 güne varan pil"] },
  { name: "Harvox X1 Pro Akıllı Saat", slug: "harvox-x1-pro", category: "erkek-modelleri", price: 2799, compareAt: 3199, reviews: 111, rating: 4.9, featured: true, short: "Paslanmaz çelik kasa, çift kordon ve NFC desteği.", features: ["Paslanmaz çelik kasa", "NFC", "Kalp ritmi & SpO2", "Çift kordon hediyeli"] },
  { name: "Harvox HX-4 Pro Akıllı Saat", slug: "harvox-hx-4-pro", category: "erkek-modelleri", price: 2199, compareAt: 2599, reviews: 154, rating: 4.8, featured: true, short: "Askeri sınıf dayanıklılık, GPS rota takibi.", features: ["Askeri sınıf gövde", "GPS rota kaydı", "Uyku analizi", "Kablosuz şarj"] },
  { name: "Watch HK 11 Pro Max Akıllı Saat", slug: "watch-hk-11-pro-max", category: "erkek-modelleri", price: 1999, compareAt: 2499, reviews: 113, rating: 4.8, featured: true, short: "Geniş ekran, özelleştirilebilir 200+ watch face.", features: ["1.96'' ekran", "200+ kadran", "Bluetooth arama", "IP67"] },
  { name: "Watch HK 11 Ultra 3 Akıllı Saat", slug: "watch-hk-11-ultra-3", category: "erkek-modelleri", price: 1999, compareAt: 2499, reviews: 112, rating: 4.8, featured: true, short: "Ultra tasarım, çift buton ve aksiyon tuşu.", features: ["Ultra kasa tasarımı", "Aksiyon tuşu", "Kompas & barometre", "Hızlı şarj"] },
  { name: "Harvox Watch 11 Mini Akıllı Saat", slug: "harvox-watch-11-mini", category: "kadin-modelleri", price: 2199, compareAt: 2599, reviews: 83, rating: 4.9, featured: true, short: "İnce kasa, kadın sağlığı takibi ve 3 kordon.", features: ["Hafif ince kasa", "Regl takibi", "3 kordon hediyeli", "Kablosuz şarj"] },
  { name: "Harvox Lady S Akıllı Saat", slug: "harvox-lady-s", category: "kadin-modelleri", price: 1899, compareAt: 2299, reviews: 47, short: "Zarif metal kordon ve altın rengi kasa.", features: ["Metal kordon", "AMOLED ekran", "Stres ölçümü"] },
  { name: "HX Kids 4G Max Akıllı Çocuk Saati", slug: "hx-kids-4g-max", category: "cocuk-modelleri", price: 4499, compareAt: 4999, reviews: 84, rating: 4.9, featured: true, short: "4G görüntülü arama, GPS konum ve güvenli alan uyarısı.", features: ["4G görüntülü görüşme", "GPS + LBS konum", "Güvenli alan bildirimi", "SOS tuşu"] },
  { name: "HX Kids 4G Pro Akıllı Çocuk Saati", slug: "hx-kids-4g-pro", category: "cocuk-modelleri", price: 3799, compareAt: 3899, reviews: 80, rating: 4.8, featured: true, short: "Sim kart destekli, ebeveyn uygulaması ile tam kontrol.", features: ["SIM kart destekli", "Ebeveyn uygulaması", "Ders modu", "Su geçirmez"] },

  // Kulaklık
  { name: "Air 3 Bluetooth Kulaklık", slug: "air-3-bluetooth-kulaklik", category: "kulakliklar", price: 998.77, compareAt: 1199.08, reviews: 106, rating: 4.8, featured: true, short: "Dokunmatik kontrol, 30 saate varan toplam kullanım.", features: ["Bluetooth 5.3", "Dokunmatik kontrol", "30 saat toplam pil", "Şeffaf eşleşme"] },
  { name: "Air Pro 2 ANC Bluetooth Kulaklık", slug: "air-pro-2-anc", category: "kulakliklar", price: 1199.08, compareAt: 1498.85, reviews: 105, rating: 4.9, featured: true, short: "Aktif gürültü engelleme ve şeffaflık modu.", features: ["Aktif gürültü engelleme (ANC)", "Şeffaflık modu", "Kablosuz şarj kutusu", "Çift mikrofon"] },
  { name: "Air 2 Bluetooth Kulaklık", slug: "air-2-bluetooth-kulaklik", category: "kulakliklar", price: 799, compareAt: 899, reviews: 64, short: "Günlük kullanım için hafif ve dengeli ses.", features: ["Hafif tasarım", "Bluetooth 5.2", "Type-C şarj"] },
  { name: "Air Pro ANC Bluetooth Kulaklık", slug: "air-pro-anc", category: "kulakliklar", price: 998.77, compareAt: 1099.16, reviews: 39, short: "Kompakt kutu, güçlü bas ve net konuşma.", features: ["ANC", "Derin bas", "Oyun modu"] },
  { name: "HX Studio Over-Ear Kulaklık", slug: "hx-studio-over-ear", category: "kulakliklar", price: 1899, compareAt: 2299, reviews: 28, short: "Kulak üstü konfor, 60 saat pil ömrü.", features: ["Kulak üstü", "60 saat pil", "Katlanabilir tasarım"] },

  // Projeksiyon
  { name: "HX Beam Mini Taşınabilir Projeksiyon", slug: "hx-beam-mini", category: "tasinabilir-projeksiyon", price: 3499, compareAt: 3999, reviews: 42, short: "Cebe sığan boyut, 120 inç görüntü.", features: ["120'' görüntü", "Dahili batarya", "Wi-Fi yansıtma", "Hoparlör dahili"] },
  { name: "HX Beam Go 4K Projeksiyon", slug: "hx-beam-go-4k", category: "tasinabilir-projeksiyon", price: 5499, compareAt: 6299, reviews: 31, short: "4K destekli, otomatik odak ve keystone.", features: ["4K destek", "Otomatik odak", "Android TV", "Bluetooth ses çıkışı"] },
  { name: "HX Cinema 1080p Ev Projeksiyon", slug: "hx-cinema-1080p", category: "ev-tipi-projeksiyon", price: 6999, compareAt: 7999, reviews: 24, short: "Gerçek Full HD panel, sessiz soğutma.", features: ["Gerçek 1080p", "Sessiz fan", "HDMI / USB", "300'' maksimum görüntü"] },
  { name: "HX Cinema Pro 4K Ev Projeksiyon", slug: "hx-cinema-pro-4k", category: "ev-tipi-projeksiyon", price: 11999, compareAt: 13499, reviews: 17, short: "Ev sineması deneyimi için 4K HDR.", features: ["4K HDR", "Dolby ses", "Motorlu odak", "Netflix sertifikalı"] },

  // Araç aksesuarları
  { name: "HX Vac Mini Kablosuz Araç Süpürgesi", slug: "hx-vac-mini", category: "arac-supurgeleri", price: 1299, compareAt: 1599, reviews: 66, short: "16000Pa emiş gücü, kablosuz kullanım.", features: ["16000Pa emiş", "Kablosuz", "HEPA filtre", "Type-C şarj"] },
  { name: "HX Vac Pro Araç Süpürgesi", slug: "hx-vac-pro", category: "arac-supurgeleri", price: 1899, compareAt: 2199, reviews: 38, short: "Metal gövde, 3 farklı başlık.", features: ["Metal gövde", "3 başlık", "Yıkanabilir filtre"] },
  { name: "HX Jump 12000mAh Akü Takviye Cihazı", slug: "hx-jump-12000", category: "aku-takviye-kompresor", price: 2499, compareAt: 2899, reviews: 51, short: "Aracını saniyeler içinde çalıştır, powerbank olarak da kullan.", features: ["12000mAh", "800A anlık akım", "LED fener", "Powerbank özelliği"] },
  { name: "HX Air Pump Dijital Hava Kompresörü", slug: "hx-air-pump", category: "aku-takviye-kompresor", price: 1499, compareAt: 1799, reviews: 44, short: "Dijital basınç ayarı ile otomatik durdurma.", features: ["Dijital ekran", "Otomatik durdurma", "Şarjlı", "Bisiklet/top adaptörü"] },
  { name: "HX Link Kablosuz CarPlay Dönüştürücü", slug: "hx-link-carplay", category: "arac-carplay-donusturucu", price: 2199, compareAt: 2599, reviews: 73, short: "Kablolu CarPlay'i kablosuza çevir, 3 saniyede bağlan.", features: ["Kablosuz CarPlay", "Android Auto", "3 sn bağlantı", "OTA güncelleme"] },
  { name: "HX Screen 9'' CarPlay Ekran", slug: "hx-screen-9", category: "arac-carplay-donusturucu", price: 4299, compareAt: 4899, reviews: 29, short: "Kurulum gerektirmeyen taşınabilir multimedya ekranı.", features: ["9'' dokunmatik", "Kablosuz CarPlay/AA", "Geri görüş desteği", "FM verici"] },
  { name: "Harvox DC-3 Araç İçi Kamera", slug: "harvox-dc-3", category: "arac-ici-kameralar", price: 2799, compareAt: 3199, reviews: 57, short: "Gece görüşlü çift kamera, park modu.", features: ["Çift kamera", "Gece görüşü", "Park modu", "Döngüsel kayıt"] },
  { name: "HX Wash Taşınabilir Yüksek Basınçlı Yıkama", slug: "hx-wash", category: "arac-yikama-makineleri", price: 2299, compareAt: 2699, reviews: 35, short: "Şarjlı, hortumsuz araç yıkama çözümü.", features: ["Şarjlı", "6 farklı sprey ucu", "Kova ile çalışır"] },
  { name: "HX Track GPS Araç Takip Cihazı", slug: "hx-track-gps", category: "arac-takip-cihazi", price: 1799, compareAt: 2099, reviews: 22, short: "Anlık konum, hız ve rota geçmişi.", features: ["Anlık konum", "Rota geçmişi", "Mobil uygulama", "Gizli montaj"] },
  { name: "HX Aroma Araç Parfümü", slug: "hx-aroma-parfum", category: "arac-parfumleri", price: 349, compareAt: 449, reviews: 91, short: "Uzun süre kalıcı, metal gövdeli difüzör.", features: ["Metal gövde", "Kalıcı koku", "Yedek kartuş dahil"] },
  { name: "HX Pixel LED Ekranlı Araç Paneli", slug: "hx-pixel-led", category: "pixel-ledler", price: 1499, compareAt: 1799, reviews: 40, short: "Kendi yazını ve animasyonunu yükle.", features: ["Mobil uygulama", "Özel animasyon", "Cam vantuz montaj"] },

  // Oyun konsolları
  { name: "HX Game Box 128GB Retro Oyun Konsolu", slug: "hx-game-box-128", category: "oyun-konsollari", price: 1999, compareAt: 2399, reviews: 61, short: "10.000+ hazır oyun, çift kumanda.", features: ["10.000+ oyun", "Çift kablosuz kumanda", "HDMI çıkış", "128GB hafıza"] },
  { name: "HX Handheld Pro Taşınabilir Konsol", slug: "hx-handheld-pro", category: "oyun-konsollari", price: 3499, compareAt: 3999, reviews: 33, short: "5 inç IPS ekran, avuç içi oyun keyfi.", features: ["5'' IPS ekran", "Hall efekt analog", "Wi-Fi çok oyunculu", "5000mAh"] },

  // Kameralar
  { name: "HX Cam 360° Wi-Fi Güvenlik Kamerası", slug: "hx-cam-360", category: "guvenlik-kameralari", price: 1499, compareAt: 1899, reviews: 88, short: "Hareket takibi, çift yönlü konuşma.", features: ["360° dönüş", "Hareket takibi", "Çift yönlü ses", "Gece görüşü"] },
  { name: "HX Cam Solar Güneş Enerjili Kamera", slug: "hx-cam-solar", category: "guvenlik-kameralari", price: 2999, compareAt: 3499, reviews: 46, short: "Kablosuz kurulum, güneş paneli ile sonsuz enerji.", features: ["Güneş paneli", "4G/Wi-Fi", "IP66", "PIR sensör"] },
  { name: "Harvox RC-5 Ön/Arka Araç Kamerası", slug: "harvox-rc-5", category: "arac-kameralari", price: 2499, compareAt: 2899, reviews: 54, short: "Ön ve arka eş zamanlı kayıt.", features: ["Ön + arka kamera", "1080p", "G-sensor", "Geniş açı"] },
  { name: "HX Action 5 4K Aksiyon Kamerası", slug: "hx-action-5", category: "aksiyon-kameralari", price: 3299, compareAt: 3799, reviews: 37, short: "Su altı 30m, elektronik sabitleme.", features: ["4K 60fps", "EIS sabitleme", "30m su geçirmez kutu", "Aksesuar seti"] },
  { name: "HX Snap 4K Dijital Fotoğraf Makinesi", slug: "hx-snap-4k", category: "dijital-fotograf-makineleri", price: 2799, compareAt: 3299, reviews: 26, short: "Vlog için çevrilebilir ekran.", features: ["4K video", "Çevrilebilir ekran", "16x zoom", "Harici mikrofon girişi"] },
  { name: "HX Baby Monitor 5'' Bebek Kamerası", slug: "hx-baby-monitor-5", category: "bebek-kameralari", price: 2399, compareAt: 2799, reviews: 43, short: "İnternetsiz çalışan güvenli bağlantı.", features: ["5'' ekran", "İnternetsiz çalışır", "Ninni modu", "Sıcaklık sensörü"] },

  // Hoparlör
  { name: "HX Sound Party 60W Bluetooth Hoparlör", slug: "hx-sound-party-60w", category: "hoparlor", price: 2799, compareAt: 3299, reviews: 58, short: "RGB ışıklı, partiyi taşıyan güç.", features: ["60W çıkış", "RGB ışık", "TWS eşleştirme", "12 saat pil"] },
  { name: "HX Sound Mini Taşınabilir Hoparlör", slug: "hx-sound-mini", category: "hoparlor", price: 999, compareAt: 1299, reviews: 71, short: "Avuç içi boyut, IPX7 suya dayanıklılık.", features: ["IPX7", "Askı ipi", "10 saat pil"] },

  // Motosiklet
  { name: "HX Moto Kask İçi Bluetooth İnterkom", slug: "hx-moto-interkom", category: "motosiklet-aksesuarlari", price: 1899, compareAt: 2299, reviews: 30, short: "1000m menzil, 6 kişilik grup konuşması.", features: ["1000m menzil", "6 kişi grup", "Su geçirmez", "Sesli komut"] },
  { name: "HX Moto Şarjlı Telefon Tutucu", slug: "hx-moto-tutucu", category: "motosiklet-aksesuarlari", price: 899, compareAt: 1099, reviews: 49, short: "Titreşim emici, kablosuz şarjlı.", features: ["Kablosuz şarj", "Titreşim emici", "Alüminyum gövde"] },

  // Mikrofon
  { name: "HX Mic Duo Kablosuz Yaka Mikrofonu", slug: "hx-mic-duo", category: "mikrofon", price: 1299, compareAt: 1599, reviews: 63, short: "İki verici, gürültü engelleme, şarj kutusu.", features: ["2 verici", "Gürültü engelleme", "Şarj kutusu", "iPhone + Android"] },
  { name: "HX Mic Studio USB Mikrofon", slug: "hx-mic-studio", category: "mikrofon", price: 1899, compareAt: 2299, reviews: 21, short: "Yayıncılar için kondenser mikrofon.", features: ["Kondenser kapsül", "RGB ışık", "Tripod ve pop filtre"] },

  // Nemlendirici
  { name: "HX Mist 4L Ultrasonik Hava Nemlendirici", slug: "hx-mist-4l", category: "hava-nemlendirici", price: 1299, compareAt: 1599, reviews: 55, short: "Sessiz çalışma, 30 saat kesintisiz buhar.", features: ["4L hazne", "30 saat çalışma", "Sessiz", "Gece lambası"] },
  { name: "HX Mist Mini Masaüstü Nemlendirici", slug: "hx-mist-mini", category: "hava-nemlendirici", price: 599, compareAt: 799, reviews: 74, short: "Masanda serinlik, USB ile çalışır.", features: ["USB ile çalışır", "Kompakt", "LED ışık"] },

  // Akıllı ürünler
  { name: "HX Smart Robot Süpürge", slug: "hx-smart-robot-supurge", category: "akilli-urunler", price: 6999, compareAt: 7999, reviews: 39, short: "Lazer haritalama ve paspas özelliği.", features: ["Lazer haritalama", "Paspas modu", "Uygulama kontrolü", "Sanal duvar"] },
  { name: "HX Smart Akıllı Priz Seti (4'lü)", slug: "hx-smart-priz-4", category: "akilli-urunler", price: 499, compareAt: 699, reviews: 82, short: "Uzaktan aç/kapa, zamanlayıcı ve tüketim takibi.", features: ["Uygulama kontrolü", "Zamanlayıcı", "Tüketim takibi", "Sesli asistan"] },

  // Setler
  { name: "Akıllı Saat + Kulaklık Kampanya Seti", slug: "saat-kulaklik-seti", category: "kampanyali-setler", price: 2999, compareAt: 3798, reviews: 68, short: "Harvox Watch 11 Pro+ ve Air 3 birlikte.", features: ["Harvox Watch 11 Pro+", "Air 3 Bluetooth Kulaklık", "Tek kutuda hediye paketi"] },
  { name: "Araç Bakım Seti (Süpürge + Kompresör)", slug: "arac-bakim-seti", category: "kampanyali-setler", price: 2599, compareAt: 3398, reviews: 34, short: "Aracının bakımı için ikili avantaj paketi.", features: ["HX Vac Mini", "HX Air Pump", "Taşıma çantası"] },
];

const REVIEWS = [
  { author: "Gökhan Karadağ", title: "Saat mükemmel", body: "Büyüklük olarak ideal, kullanımı çok akıcı bir ürün. Saatten çok memnun kaldı eşim, teşekkür ederim." },
  { author: "Görkem Selçik", title: "Süper bayıldım", body: "Eşime evlilik yıldönümü hediyesi olarak aldım, çok beğendi. Fiyatına göre gayet iyi, sorunsuz ve güzel çalışıyor." },
  { author: "Ebru Aslandağ", title: "Müptelası olacaksınız", body: "Tasarım ve uygulama tarafı mükemmel, ayrıca çok estetik. Düşünmeden almanızı tavsiye ederim." },
  { author: "M. Fatih Türkmenoğlu", title: "Araştırıp aldım", body: "Birçok özelliğine zaten aşinaydım. Genel hatlarıyla değerlendirmek gerekirse üründen memnun kaldığımı söyleyebilirim." },
  { author: "Fatih Gencigör", title: "Güzel ve kaliteli", body: "Bir haftaya yakındır kullanıyorum, çok güzel bir saat. Kordonları da kaliteli, tavsiye ederim." },
  { author: "Volkan Bener", title: "Memnuniyet", body: "Ürünü almadan önce sorduğum her soruya hızla cevap aldım, ürün bir günde bana ulaştı ve cihaza hayran kaldım." },
  { author: "Enes K.", title: "Güven ve hız", body: "Almadan önce çok tereddüt etmiştim ama şimdi neden beklediğime kızıyorum. Her şey için teşekkürler." },
  { author: "Emir Han", title: "Maşallah", body: "Çok sağlam bir şekilde elime ulaştı. Satıcıya ayrıca teşekkür ediyorum, bol kazançlar." },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "Enteknoloji",
  site_tagline: "Teknolojinin en yenilikçi ürünleri",
  hero_title: "Teknolojiyi hayatının merkezine al",
  hero_subtitle:
    "Akıllı saatlerden araç aksesuarlarına kadar günlük hayatını kolaylaştıran ürünler, 2 yıl garanti ve ücretsiz kargo ile.",
  hero_cta_text: "Kampanyaları keşfet",
  hero_cta_link: "/kategori/kampanyali-setler",
  announcements:
    "♻️ 2 yıl garantiye ek kapsamlı servis garantisi|🥰 +220.000 mutlu müşteri|🚚 Ücretsiz kargo ve hızlı teslimat",
  free_shipping_threshold: "0",
  shipping_cost: "0",
  support_phone: "0850 000 00 00",
  support_email: "destek@enteknoloji.com.tr",
  whatsapp_number: "905000000000",
  footer_text:
    "Teknolojinin en son trendlerini takip ediyor ve sizin için en iyi, en yenilikçi hayat kurtaran teknoloji ürünlerini sunuyoruz.",
  stat_customers: "+150.000",
  stat_satisfaction: "%98.7",
  stat_rating: "4.9/5",
};

export async function seedDatabase(client: Client) {
  const existing = await client.execute("SELECT COUNT(*) AS c FROM categories");
  const count = Number((existing.rows[0] as unknown as { c: number }).c);

  await seedAdmin(client);
  await seedSettings(client);

  if (count > 0) return;

  const categoryIds = new Map<string, number>();

  for (const [index, category] of CATEGORIES.entries()) {
    const result = await client.execute({
      sql: `INSERT INTO categories (name, slug, description, accent, icon, parent_id, sort_order)
            VALUES (?, ?, ?, ?, ?, NULL, ?)`,
      args: [category.name, category.slug, category.description ?? "", category.accent, category.icon, index],
    });
    const parentId = Number(result.lastInsertRowid);
    categoryIds.set(category.slug, parentId);

    for (const [childIndex, child] of (category.children ?? []).entries()) {
      const childResult = await client.execute({
        sql: `INSERT INTO categories (name, slug, description, accent, icon, parent_id, sort_order)
              VALUES (?, ?, '', ?, ?, ?, ?)`,
        args: [child.name, child.slug, category.accent, category.icon, parentId, childIndex],
      });
      categoryIds.set(child.slug, Number(childResult.lastInsertRowid));
    }
  }

  for (const [index, product] of PRODUCTS.entries()) {
    await client.execute({
      sql: `INSERT INTO products
              (name, slug, sku, short_description, description, price, compare_at_price, stock,
               category_id, image_url, gallery, features, rating, review_count, is_active, is_featured, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '', '[]', ?, ?, ?, 1, ?, ?)`,
      args: [
        product.name,
        product.slug,
        `HX-${1000 + index}`,
        product.short,
        `${product.name}, Enteknoloji güvencesiyle 2 yıl garantili olarak gönderilir. ${product.short} Ürün orijinal kutusunda, tüm aksesuarları ile birlikte kargolanır.`,
        product.price,
        product.compareAt,
        50,
        categoryIds.get(product.category) ?? null,
        JSON.stringify(product.features ?? []),
        product.rating ?? 4.7,
        product.reviews,
        product.featured ? 1 : 0,
        index,
      ],
    });
  }

  for (const review of REVIEWS) {
    await client.execute({
      sql: `INSERT INTO reviews (product_id, author, rating, title, body, is_featured)
            VALUES (NULL, ?, 5, ?, ?, 1)`,
      args: [review.author, review.title, review.body],
    });
  }
}

async function seedAdmin(client: Client) {
  const email = (process.env.ADMIN_EMAIL ?? "admin@enteknoloji.com").toLowerCase();
  const existing = await client.execute("SELECT COUNT(*) AS c FROM admin_users");

  if (Number((existing.rows[0] as unknown as { c: number }).c) > 0) return;

  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 10);

  await client.execute({
    sql: "INSERT INTO admin_users (email, name, password_hash) VALUES (?, ?, ?)",
    args: [email, "Yönetici", hash],
  });
}

async function seedSettings(client: Client) {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
      args: [key, value],
    });
  }
}

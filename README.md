# Enteknoloji — E-ticaret + Yönetim Paneli

Next.js 16 (App Router) ile yazılmış, Türkçe, modern bir e-ticaret sitesi ve yönetim paneli.
Ödeme altyapısı **iyzico**, veritabanı **SQLite/Turso**, hedef platform **Netlify**.

---

## Hızlı başlangıç

```bash
npm install
npm run dev
```

`http://localhost:3000` adresini aç. Veritabanı ilk açılışta `data/store.db` olarak
otomatik oluşturulur; kategoriler, 49 örnek ürün ve yorumlar kendiliğinden yüklenir.

**Yönetim paneli:** `http://localhost:3000/admin`

| | |
|---|---|
| E-posta | `admin@enteknoloji.com` |
| Şifre | `admin123` |

Bu bilgileri `.env` dosyasındaki `ADMIN_EMAIL` / `ADMIN_PASSWORD` ile değiştirebilir,
ya da panelden **Ayarlar → Şifre değiştir** ile güncelleyebilirsin.

---

## Neler var?

**Mağaza**
- Duyuru şeridi, mega menülü sticky header, mobil menü, arama
- Kategori ızgarası, çok seviyeli kategoriler (ana + alt kategori)
- Ürün listeleme (sıralama + sayfalama), ürün detay, benzer ürünler
- localStorage tabanlı sepet + yan panel (drawer)
- Ödeme formu, iyzico yönlendirmesi, sipariş sonuç sayfası
- Sipariş takip, müşteri yorumları, SSS, bülten kaydı, WhatsApp butonu

**Yönetim paneli** (`/admin`)
- Genel bakış: ciro, sipariş sayıları, stok azalan ürünler
- Ürün ekle/düzenle/sil: fiyat, indirimli fiyat, stok, galeri, özellikler, öne çıkarma
- Kategori ekle/düzenle/sil: üst kategori, renk paleti, ikon seçimi
- Sipariş listesi, detay, durum güncelleme
- Ayarlar: vitrin metinleri, duyurular, iletişim, kargo, istatistikler
- Bülten aboneleri

---

## Veritabanı

Tek bir kod yolu iki ortamda da çalışır:

| Ortam | Ne kullanılır | Kurulum |
|---|---|---|
| Lokal | `data/store.db` (SQLite dosyası) | Yok, otomatik |
| Netlify | [Turso](https://turso.tech) (ücretsiz plan) | 2 ortam değişkeni |

Şema ve örnek veri, ilk sorguda `src/lib/schema.ts` + `src/lib/seed.ts` üzerinden
kendiliğinden kurulur. Ayrı bir migration komutu çalıştırmana gerek yok.

Turso hesabı açtıktan sonra:

```bash
turso db create enteknoloji
turso db show enteknoloji --url        # TURSO_DATABASE_URL
turso db tokens create enteknoloji     # TURSO_AUTH_TOKEN
```

---

## iyzico

`IYZICO_API_KEY` ve `IYZICO_SECRET_KEY` tanımlı **değilse** site yine çalışır:
siparişler "havale/EFT" olarak kaydedilir ve müşteriye ödeme talimatı gösterilir.

Anahtarları girdiğinde ödeme akışı şöyle işler:

1. Müşteri `/odeme` formunu doldurur → `POST /api/checkout`
2. Sunucu fiyatları **veritabanından** doğrular, siparişi oluşturur
3. iyzico Checkout Form başlatılır, müşteri iyzico ödeme sayfasına yönlenir
4. iyzico `POST /api/iyzico/callback` adresine döner
5. Ödeme doğrulanır, sipariş `paid` olarak işaretlenir, stok düşülür

Test kartları için: https://dev.iyzipay.com/tr/test-kartlari

Canlıya geçerken `IYZICO_BASE_URL` değerini `https://api.iyzipay.com` yap.

---

## Netlify'a yayınlama

1. Projeyi bir git deposuna gönder ve Netlify'da "Import from Git" ile bağla.
   Build ayarları `netlify.toml` içinde hazır.
2. Site ayarlarından **Environment variables** kısmına şunları ekle:

```
TURSO_DATABASE_URL   = libsql://...
TURSO_AUTH_TOKEN     = ...
AUTH_SECRET          = uzun-rastgele-bir-deger
ADMIN_EMAIL          = kendi@mailin.com
ADMIN_PASSWORD       = guclu-bir-sifre
IYZICO_API_KEY       = ...
IYZICO_SECRET_KEY    = ...
IYZICO_BASE_URL      = https://api.iyzipay.com
NEXT_PUBLIC_SITE_URL = https://alanadin.com
```

3. Deploy et. İlk istekte tablolar ve örnek içerik Turso'da oluşur.

> `NEXT_PUBLIC_SITE_URL` önemli: iyzico'ya gönderilen callback adresi buradan üretilir.

---

## Klasör yapısı

```
src/
  app/
    (store)/          mağaza sayfaları (header + footer ile)
    admin/            yönetim paneli (login + korumalı panel)
    api/              checkout ve iyzico callback uçları
  components/         paylaşılan arayüz bileşenleri
    admin/            panele özel formlar
  lib/
    db.ts             libSQL bağlantısı + otomatik kurulum
    schema.ts         tablo tanımları
    seed.ts           kategori, ürün ve yorum örnek verisi
    queries.ts        tüm veritabanı sorguları
    auth.ts           yönetici girişi (bcrypt + JWT çerez)
    iyzico.ts         ödeme entegrasyonu
  proxy.ts            /admin rotalarını koruyan oturum kontrolü
```

## Komutlar

```bash
npm run dev     # geliştirme sunucusu
npm run build   # üretim derlemesi
npm run start   # derlenmiş sürümü çalıştır
npm run lint    # eslint
```

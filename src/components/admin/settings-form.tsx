"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { saveSettingsAction, type FormState } from "@/app/admin/actions";
import { ImageUpload } from "@/components/admin/image-upload";
import { THEME_PRESETS } from "@/lib/theme";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-2">
        <Box title="Kimlik">
          <Field name="site_name" label="Mağaza adı" settings={settings} />
          <Field name="logo_text" label="Logo yazısı" settings={settings} />
          <ImageUpload name="logo_url" defaultValue={settings.logo_url} label="Logo" />
          <ImageUpload name="favicon_url" defaultValue={settings.favicon_url} label="Favicon / sekme ikonu" />
          <Field name="site_tagline" label="Slogan" settings={settings} />
        </Box>

        <Box title="Kayan yazı">
          <Field name="announcements" label="Metinler (| ile ayır)" settings={settings} textarea />
          <Field name="announcement_speed" label="Hız (saniye)" settings={settings} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="announcements_enabled" defaultChecked={settings.announcements_enabled !== "0"} />
            Aktif
          </label>
          <Color name="theme_announcement_bg" label="Arka plan" settings={settings} />
          <Color name="theme_announcement_text" label="Yazı rengi" settings={settings} />
        </Box>

        <Box title="Tema renkleri">
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  for (const [key, value] of Object.entries(preset.values)) {
                    const input = document.querySelector<HTMLInputElement>(`input[name="${key}"]`);
                    if (input) input.value = value;
                  }
                }}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold"
              >
                {preset.name}
              </button>
            ))}
          </div>
          <Color name="theme_primary" label="Ana renk" settings={settings} />
          <Color name="theme_primary_text" label="Ana renk yazı" settings={settings} />
          <Color name="theme_header_bg" label="Üst menü arka plan" settings={settings} />
          <Color name="theme_header_text" label="Üst menü yazı" settings={settings} />
          <Color name="theme_page_bg" label="Sayfa arka plan" settings={settings} />
          <Color name="theme_text" label="Metin rengi" settings={settings} />
          <Color name="theme_footer_bg" label="Footer arka plan" settings={settings} />
          <Color name="theme_footer_text" label="Footer yazı" settings={settings} />
        </Box>

        <Box title="Anasayfa vitrini">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="hero_enabled" defaultChecked={settings.hero_enabled !== "0"} />
            Vitrin bandını göster
          </label>
          <Field name="hero_badge" label="Rozet" settings={settings} />
          <Field name="hero_title" label="Başlık" settings={settings} />
          <Field name="hero_subtitle" label="Alt başlık" settings={settings} textarea />
          <Field name="hero_cta_text" label="Buton yazısı" settings={settings} />
          <Field name="hero_cta_link" label="Buton bağlantısı" settings={settings} />
          <ImageUpload name="hero_image_url" defaultValue={settings.hero_image_url} label="Vitrin görseli" />
          <Field name="section_categories_title" label="Kategoriler başlığı" settings={settings} />
          <Field name="section_categories_subtitle" label="Kategoriler alt yazı" settings={settings} />
          <Field name="section_featured_title" label="Seçtiklerimiz başlığı" settings={settings} />
          <Field name="section_bestsellers_title" label="Çok satanlar" settings={settings} />
          <Field name="section_new_title" label="Yeni gelenler" settings={settings} />
          <Field name="section_reviews_title" label="Yorumlar başlığı" settings={settings} />
          <Field name="section_faq_title" label="SSS başlığı" settings={settings} />
          <div className="grid gap-2 text-sm">
            {[
              ["show_categories", "Kategoriler"],
              ["show_featured", "Seçtiklerimiz"],
              ["show_bestsellers", "Çok satanlar"],
              ["show_new", "Yeni gelenler"],
              ["show_stats", "İstatistikler"],
              ["show_reviews", "Yorumlar"],
              ["show_faq", "SSS"],
              ["show_footer_slider", "Footer slayt"],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-2">
                <input type="checkbox" name={name} defaultChecked={settings[name] !== "0"} />
                {label}
              </label>
            ))}
          </div>
        </Box>

        <Box title="İletişim">
          <Field name="support_phone" label="Telefon" settings={settings} />
          <Field name="support_email" label="E-posta" settings={settings} />
          <Field name="whatsapp_number" label="WhatsApp (905xxxxxxxxx)" settings={settings} />
          <Field name="whatsapp_message" label="WhatsApp mesajı" settings={settings} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="whatsapp_enabled" defaultChecked={settings.whatsapp_enabled !== "0"} />
            WhatsApp butonu
          </label>
        </Box>

        <Box title="Sosyal medya">
          <Field name="social_instagram" label="Instagram" settings={settings} />
          <Field name="social_youtube" label="YouTube" settings={settings} />
          <Field name="social_tiktok" label="TikTok" settings={settings} />
          <Field name="social_facebook" label="Facebook" settings={settings} />
          <Field name="social_x" label="X" settings={settings} />
        </Box>

        <Box title="SEO">
          <Field name="seo_title" label="Varsayılan başlık" settings={settings} />
          <Field name="seo_description" label="Açıklama" settings={settings} textarea />
          <Field name="seo_keywords" label="Anahtar kelimeler" settings={settings} />
          <ImageUpload name="seo_og_image" defaultValue={settings.seo_og_image} label="Paylaşım görseli" />
        </Box>

        <Box title="Footer">
          <Field name="footer_text" label="Açıklama" settings={settings} textarea />
          <Field name="footer_col1_title" label="1. sütun başlığı" settings={settings} />
          <Field name="footer_col2_title" label="2. sütun başlığı" settings={settings} />
          <Field name="footer_col3_title" label="3. sütun başlığı" settings={settings} />
          <Field name="footer_newsletter_title" label="Bülten başlığı" settings={settings} />
          <Field name="footer_newsletter_text" label="Bülten metni" settings={settings} textarea />
        </Box>
      </section>

      {state.success && (
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="size-4" /> {state.success}
        </p>
      )}
      <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-8 py-3 text-sm font-bold text-white">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Tüm görünümü kaydet
      </button>
    </form>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
      <h2 className="text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  name,
  label,
  settings,
  textarea,
}: {
  name: string;
  label: string;
  settings: Record<string, string>;
  textarea?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={LABEL}>{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} defaultValue={settings[name] ?? ""} className={FIELD} />
      ) : (
        <input name={name} defaultValue={settings[name] ?? ""} className={FIELD} />
      )}
    </label>
  );
}

function Color({ name, label, settings }: { name: string; label: string; settings: Record<string, string> }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <input name={name} type="color" defaultValue={settings[name] || "#000000"} className="h-9 w-16 rounded-lg border border-ink-200" />
    </label>
  );
}

"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { saveSettingsAction, type FormState } from "@/app/admin/actions";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";
const LABEL = "text-xs font-bold uppercase tracking-wide text-ink-400";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-2">
      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Mağaza</h2>

        <Field name="site_name" label="Mağaza adı" settings={settings} />
        <Field name="site_tagline" label="Slogan" settings={settings} />
        <Field
          name="announcements"
          label="Duyuru şeridi (| ile ayırın)"
          settings={settings}
          textarea
        />
        <Field name="footer_text" label="Alt bilgi metni" settings={settings} textarea />
      </section>

      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Anasayfa vitrini</h2>

        <Field name="hero_title" label="Başlık" settings={settings} />
        <Field name="hero_subtitle" label="Alt başlık" settings={settings} textarea />
        <Field name="hero_cta_text" label="Buton yazısı" settings={settings} />
        <Field name="hero_cta_link" label="Buton bağlantısı" settings={settings} />
      </section>

      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">İletişim ve kargo</h2>

        <Field name="support_email" label="Destek e-postası" settings={settings} />
        <Field name="support_phone" label="Destek telefonu" settings={settings} />
        <Field name="whatsapp_number" label="WhatsApp numarası (905xxxxxxxxx)" settings={settings} />
        <Field name="shipping_cost" label="Kargo ücreti (TL)" settings={settings} />
        <Field
          name="free_shipping_threshold"
          label="Ücretsiz kargo limiti (TL)"
          settings={settings}
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Anasayfa istatistikleri</h2>

        <Field name="stat_customers" label="Mutlu müşteri" settings={settings} />
        <Field name="stat_satisfaction" label="Müşteri memnuniyeti" settings={settings} />
        <Field name="stat_rating" label="Ürün puanı" settings={settings} />
      </section>

      <div className="xl:col-span-2">
        {state.success && (
          <p className="mb-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Ayarları kaydet
        </button>
      </div>
    </form>
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

import { CheckCircle2, XCircle } from "lucide-react";

import { PasswordForm } from "@/components/admin/password-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { isIyzicoConfigured } from "@/lib/iyzico";
import { getSettings, listSubscribers } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayarlar" };

export default async function AdminSettingsPage() {
  const [settings, subscribers] = await Promise.all([getSettings(), listSubscribers()]);
  const iyzico = isIyzicoConfigured();
  const sandbox = (process.env.IYZICO_BASE_URL ?? "").includes("sandbox") || !process.env.IYZICO_BASE_URL;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Ayarlar</h1>
        <p className="text-sm text-ink-400">Mağaza içeriğini ve hesabını buradan yönet.</p>
      </header>

      <section className="rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Ödeme altyapısı</h2>
        <div className="mt-3 flex items-center gap-2 text-sm">
          {iyzico ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>
                iyzico bağlı — <strong>{sandbox ? "sandbox (test)" : "canlı"}</strong> ortamı kullanılıyor.
              </span>
            </>
          ) : (
            <>
              <XCircle className="size-4 text-amber-500" />
              <span>
                iyzico anahtarları tanımlı değil. <code className="rounded bg-ink-50 px-1">IYZICO_API_KEY</code> ve{" "}
                <code className="rounded bg-ink-50 px-1">IYZICO_SECRET_KEY</code> ortam değişkenlerini ekleyin.
              </span>
            </>
          )}
        </div>
      </section>

      <SettingsForm settings={settings} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PasswordForm />

        <section className="rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">Bülten aboneleri ({subscribers.length})</h2>
          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm text-ink-500">
            {subscribers.length === 0 ? (
              <p className="py-6 text-center text-ink-400">Henüz abone yok.</p>
            ) : (
              subscribers.map((subscriber) => <p key={subscriber.id}>{subscriber.email}</p>)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

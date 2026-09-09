import { CheckCircle2, XCircle } from "lucide-react";

import { deleteStaffAction, submitStaffAction } from "@/app/admin/actions";
import { PasswordForm } from "@/components/admin/password-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { isIyzicoConfigured } from "@/lib/iyzico";
import { listAdmins, listSubscribers } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayarlar" };

const FIELD = "w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm";

export default async function AdminSettingsPage() {
  const [admins, subscribers] = await Promise.all([listAdmins(), listSubscribers()]);
  const iyzico = isIyzicoConfigured();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Ayarlar</h1>

      <section className="rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">iyzico</h2>
        <p className="mt-2 flex items-center gap-2 text-sm">
          {iyzico ? <CheckCircle2 className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-amber-500" />}
          {iyzico
            ? "API anahtarları tanımlı. Ödeme, iyzico’dan dönen tutar üzerinden doğrulanır."
            : "IYZICO_API_KEY ve IYZICO_SECRET_KEY ortam değişkenlerini ekle. Anahtar yokken siparişler havale olarak kaydedilir."}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <PasswordForm />

        <form action={submitStaffAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">Yönetici ekle</h2>
          <input name="name" placeholder="Ad" className={FIELD} />
          <input name="email" required placeholder="Giriş adı" className={FIELD} />
          <input name="password" type="password" required placeholder="Şifre" className={FIELD} />
          <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Hesap aç</button>
        </form>
      </div>

      <section className="rounded-3xl border border-ink-100 bg-white">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-bold">Yöneticiler</h2>
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{admin.name}</p>
              <p className="text-xs text-ink-400">{admin.role}</p>
            </div>
            <DeleteButton id={admin.id} action={deleteStaffAction} confirmText="Yönetici silinsin mi?" />
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Bülten ({subscribers.length})</h2>
        <div className="mt-3 max-h-48 overflow-y-auto text-sm text-ink-500">
          {subscribers.map((item) => <p key={item.id}>{item.email}</p>)}
        </div>
      </section>
    </div>
  );
}

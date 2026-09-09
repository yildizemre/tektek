"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import {
  changeAccountPasswordAction,
  updateProfileAction,
  type AccountState,
} from "@/app/(store)/hesap/actions";
import { TR_CITIES } from "@/lib/cities";
import type { User } from "@/lib/types";

const FIELD =
  "w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export function ProfileForm({ user }: { user: Omit<User, "password_hash"> }) {
  const [state, formAction, pending] = useActionState<AccountState, FormData>(updateProfileAction, {});

  return (
    <form action={formAction} className="space-y-3 rounded-3xl border border-ink-100 p-6">
      <h2 className="text-sm font-bold">İletişim ve adres</h2>
      <input name="name" defaultValue={user.name} required className={FIELD} />
      <input name="phone" defaultValue={user.phone} placeholder="Telefon" className={FIELD} />
      <textarea name="address" rows={2} defaultValue={user.address} placeholder="Adres" className={FIELD} />
      <div className="grid gap-3 sm:grid-cols-2">
        <select name="city" defaultValue={user.city} className={FIELD}>
          <option value="">İl</option>
          {TR_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <input name="district" defaultValue={user.district} placeholder="İlçe" className={FIELD} />
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Kaydet"}
      </button>
    </form>
  );
}

export function AccountPasswordForm() {
  const [state, formAction, pending] = useActionState<AccountState, FormData>(
    changeAccountPasswordAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3 rounded-3xl border border-ink-100 p-6">
      <h2 className="text-sm font-bold">Şifre değiştir</h2>
      <input name="currentPassword" type="password" required placeholder="Mevcut şifre" className={FIELD} />
      <input name="newPassword" type="password" required minLength={6} placeholder="Yeni şifre" className={FIELD} />
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="rounded-full bg-ink-900 px-6 py-2.5 text-sm font-bold text-white">
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Şifreyi güncelle"}
      </button>
    </form>
  );
}

function Feedback({ state }: { state: AccountState }) {
  if (state.error) {
    return (
      <p className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="size-4" /> {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle2 className="size-4" /> {state.success}
      </p>
    );
  }
  return null;
}

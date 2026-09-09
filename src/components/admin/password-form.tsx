"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { changePasswordAction, type FormState } from "@/app/admin/actions";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(changePasswordAction, {});

  return (
    <form action={formAction} className="max-w-md space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
      <h2 className="text-sm font-bold">Şifre değiştir</h2>

      <input
        name="currentPassword"
        type="password"
        required
        placeholder="Mevcut şifre"
        className={FIELD}
        autoComplete="current-password"
      />
      <input
        name="newPassword"
        type="password"
        required
        placeholder="Yeni şifre (en az 6 karakter)"
        className={FIELD}
        autoComplete="new-password"
      />

      {state.error && (
        <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Şifreyi güncelle
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { loginAction, type FormState } from "@/app/admin/actions";

const FIELD =
  "w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input name="email" type="email" required placeholder="E-posta" className={FIELD} autoComplete="username" />
      <input
        name="password"
        type="password"
        required
        placeholder="Şifre"
        className={FIELD}
        autoComplete="current-password"
      />

      {state.error && (
        <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Giriş yap
      </button>
    </form>
  );
}

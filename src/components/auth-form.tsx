"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { loginAction, registerAction, type AuthState } from "@/app/actions";

const FIELD =
  "w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm outline-none transition focus:border-ink-900";

export function LoginForm({ next = "/hesap" }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <input name="email" required placeholder="E-posta" className={FIELD} autoComplete="username" />
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
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-primary disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Giriş yap
      </button>

      <p className="text-center text-sm text-ink-400">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-ink-900 hover:text-primary">
          Üye ol
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(registerAction, {});

  return (
    <form action={formAction} className="space-y-3">
      <input name="name" required placeholder="Ad Soyad" className={FIELD} autoComplete="name" />
      <input name="email" type="email" required placeholder="E-posta" className={FIELD} autoComplete="email" />
      <input name="phone" placeholder="Telefon (5xx xxx xx xx)" className={FIELD} autoComplete="tel" />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Şifre (en az 6 karakter)"
        className={FIELD}
        autoComplete="new-password"
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
        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3.5 text-sm font-bold text-white transition hover:bg-primary disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Üye ol
      </button>

      <p className="text-center text-sm text-ink-400">
        Zaten üye misin?{" "}
        <Link href="/giris" className="font-semibold text-ink-900 hover:text-primary">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}

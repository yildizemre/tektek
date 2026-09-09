"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { subscribeAction, type SubscribeState } from "@/app/actions";

const initialState: SubscribeState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex items-center gap-2 rounded-full border border-ink-200 bg-white p-1.5 pl-4">
        <input
          type="email"
          name="email"
          required
          placeholder="E-posta adresin"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-300"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Abone ol"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-900 text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {state.status === "success" ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>

      {state.message && (
        <p className={`text-xs ${state.status === "error" ? "text-red-500" : "text-emerald-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

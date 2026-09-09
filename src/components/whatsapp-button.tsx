"use client";

import { useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";

type Props = {
  number?: string;
  phoneLabel?: string;
  message?: string;
};

export function WhatsappButton({ number, phoneLabel, message }: Props) {
  const [open, setOpen] = useState(false);
  if (!number) return null;

  const digits = number.replace(/\D/g, "");
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <div className="fixed bottom-5 left-4 z-40 flex flex-col items-start gap-3 sm:left-5">
      {open && (
        <div className="w-72 overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/20">
              <MessageCircle className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">Canlı destek</p>
              <p className="text-[11px] opacity-90">Genelde dakikalar içinde yanıtlıyoruz</p>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <p className="text-sm text-ink-500">
              Merhaba 👋 Ürünler, kargo ve iade hakkında aklına gelen her şeyi WhatsApp&apos;tan sorabilirsin.
            </p>

            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95"
            >
              <MessageCircle className="size-4" />
              WhatsApp&apos;tan yaz
            </a>

            {phoneLabel && (
              <a
                href={`tel:${phoneLabel.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 rounded-full border border-ink-200 px-4 py-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50"
              >
                <Phone className="size-4" />
                {phoneLabel}
              </a>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Destek panelini kapat" : "WhatsApp destek"}
        className="group flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-xl transition hover:scale-[1.03]"
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        )}
        {phoneLabel && !open && (
          <span className="hidden text-sm font-bold sm:inline">{phoneLabel}</span>
        )}
      </button>
    </div>
  );
}

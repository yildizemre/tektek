import { ChevronDown } from "lucide-react";

import type { Faq as FaqItem } from "@/lib/types";

export function Faq({
  faqs,
  title = "Sıkça Sorulan Sorular",
}: {
  faqs: FaqItem[];
  title?: string;
}) {
  if (faqs.length === 0) return null;

  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>

      <div className="divide-y divide-ink-100 overflow-hidden rounded-3xl border border-ink-100">
        {faqs.map((faq) => (
          <details key={faq.id} className="group bg-white px-5 py-4 open:bg-ink-50">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  title?: string;
  action?: React.ReactNode;
  itemClassName?: string;
  children: React.ReactNode;
};

export function Rail({ title, action, itemClassName = "w-64 sm:w-72", children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(track.clientWidth * 0.8, 280), behavior: "smooth" });
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        {title && <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>}

        <div className="flex items-center gap-2">
          {action}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label="Geri"
              onClick={() => scrollBy(-1)}
              className="grid size-9 place-items-center rounded-full border border-ink-200 transition hover:bg-ink-900 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="İleri"
              onClick={() => scrollBy(1)}
              className="grid size-9 place-items-center rounded-full border border-ink-200 transition hover:bg-ink-900 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={index} className={`shrink-0 snap-start ${itemClassName}`}>
                {child}
              </div>
            ))
          : children}
      </div>
    </section>
  );
}

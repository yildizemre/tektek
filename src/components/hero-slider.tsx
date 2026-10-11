"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { src: "/slider/teknoloji-full-set.webp", alt: "Teknoloji Full Set" },
  { src: "/slider/eglence-full-set.webp", alt: "Eğlence Full Set" },
  { src: "/slider/arac-ici-full-set.webp", alt: "Araç İçi Full Set" },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const go = (step: number) => setIndex((i) => (i + step + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <div className="group relative overflow-hidden rounded-4xl bg-ink-900">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className="aspect-[1916/821] w-full shrink-0 object-cover"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label="Önceki"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70 sm:left-5 sm:size-12"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        aria-label="Sonraki"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70 sm:right-5 sm:size-12"
      >
        <ChevronRight className="size-6" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`${i + 1}. görsel`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CAMPAIGN_SETS } from "@/lib/set-data";

const slides = CAMPAIGN_SETS.map((set) => ({ src: set.banner, alt: set.name, href: `/set/${set.slug}` }));

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
          <div key={slide.src} className="relative w-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="aspect-[1916/821] w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {/* Görseldeki "Hemen İncele" butonunun üstüne denk gelen tıklanabilir alan */}
            <Link
              href={slide.href}
              aria-label={`${slide.alt} – Hemen İncele`}
              tabIndex={i === index ? 0 : -1}
              className="absolute left-[2.6%] top-[79%] h-[11.5%] w-[22%] rounded-full transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            />
          </div>
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

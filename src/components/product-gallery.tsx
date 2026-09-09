"use client";

import { useState } from "react";

import { Media } from "./media";

export function ProductGallery({
  images,
  alt,
  accent,
  icon,
}: {
  images: string[];
  alt: string;
  accent: string;
  icon: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-3xl border border-ink-100">
        <Media src={current} alt={alt} accent={accent} icon={icon} iconClassName="size-24" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`size-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                index === active ? "border-ink-900" : "border-ink-100 hover:border-ink-300"
              }`}
            >
              <Media
                src={image}
                alt={`${alt} ${index + 1}`}
                accent={accent}
                icon={icon}
                iconClassName="size-6"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { accentGradient } from "@/lib/palette";
import type { Category } from "@/lib/types";

import { CategoryIcon } from "./category-icon";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className="group relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-3xl p-5 transition hover:shadow-[0_20px_50px_-25px_rgba(11,13,24,0.5)]"
      style={{ background: accentGradient(category.accent) }}
    >
      {category.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.image_url}
          alt={category.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <CategoryIcon
          name={category.icon}
          className="absolute -bottom-5 -right-3 size-36 text-ink-900/15 transition duration-500 group-hover:scale-110"
        />
      )}

      <div className="relative flex items-start justify-between">
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-ink-700 backdrop-blur">
          {category.name}
        </span>
        <span className="grid size-8 place-items-center rounded-full bg-ink-900 text-white opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

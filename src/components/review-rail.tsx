import { Star } from "lucide-react";

import type { Review } from "@/lib/types";

import { Rail } from "./rail";

export function ReviewRail({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <Rail title="Sizden Gelenler" itemClassName="w-72 sm:w-80">
      {reviews.map((review) => (
        <figure key={review.id} className="flex h-full flex-col gap-3 rounded-3xl bg-ink-50 p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-ink-900 text-sm font-bold text-white">
              {review.author.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <figcaption className="text-sm font-semibold">{review.author}</figcaption>
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm font-bold">{review.title}</p>
          <blockquote className="text-sm leading-relaxed text-ink-500">{review.body}</blockquote>
        </figure>
      ))}
    </Rail>
  );
}

"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, Star, X } from "lucide-react";

import { submitCustomerReviewAction, type ReviewState } from "@/app/actions";

import { uploadImage } from "./admin/image-upload";

const FIELD =
  "w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900";
const MAX_PHOTOS = 5;

export function ReviewForm({ productId, defaultName = "" }: { productId: number; defaultName?: string }) {
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(submitCustomerReviewAction, {
    status: "idle",
    message: "",
  });
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
        const url = await uploadImage(file, { endpoint: "/api/reviews/upload", maxEdge: 1280 });
        setPhotos((current) => [...current, url].slice(0, MAX_PHOTOS));
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Fotoğraf yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (state.status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <CheckCircle2 className="size-5 shrink-0" />
        {state.message}
      </div>
    );
  }

  return (
    <form id="yorum-yap" action={formAction} className="space-y-3 rounded-3xl border border-ink-100 p-5 sm:p-6">
      <h3 className="text-lg font-extrabold">Yorum yap</h3>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="images" value={JSON.stringify(photos)} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Puan">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} yıldız`}
            onClick={() => setRating(value)}
            className="p-0.5"
          >
            <Star className={`size-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="author" required defaultValue={defaultName} maxLength={60} placeholder="Adın *" className={FIELD} />
        <input name="title" maxLength={120} placeholder="Başlık (opsiyonel)" className={FIELD} />
      </div>
      <textarea name="body" required rows={3} maxLength={2000} placeholder="Ürünü nasıl buldun? *" className={FIELD} />

      <div className="flex flex-wrap gap-2">
        {photos.map((url) => (
          <div key={url} className="relative size-20 overflow-hidden rounded-2xl border border-ink-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label="Fotoğrafı kaldır"
              onClick={() => setPhotos((current) => current.filter((item) => item !== url))}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink-900/80 text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink-200 text-[11px] font-semibold text-ink-400 transition hover:border-ink-400"
          >
            {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
            Fotoğraf
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => addPhotos(event.target.files)}
        />
      </div>
      {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending || uploading}
        className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Yorumu gönder
      </button>
      <p className="text-xs text-ink-400">Yorumun onaylandıktan sonra yayınlanır. En fazla {MAX_PHOTOS} fotoğraf ekleyebilirsin.</p>
    </form>
  );
}

"use client";

import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";

const MAX_EDGE = 1400;

/** Downscales in the browser so uploads stay small enough for the database. */
async function compress(file: File): Promise<Blob> {
  if (file.type === "image/svg+xml" || file.type === "image/gif" || file.type === "image/x-icon") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );

  return blob && blob.size < file.size ? blob : file;
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await compress(file);
  const body = new FormData();
  body.append("file", new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: blob.type }));

  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) throw new Error(data.error ?? "Görsel yüklenemedi.");
  return data.url;
}

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
  className?: string;
};

export function ImageUpload({ name, defaultValue = "", label, hint, className }: Props) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");

    try {
      setValue(await uploadImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Görsel yüklenemedi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span>
      ) : null}

      <input type="hidden" name={name} value={value} />

      <div className="flex items-start gap-3">
        <label
          htmlFor={inputId}
          className="group relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
        >
          {value ? (
            <Image
              src={value}
              alt=""
              width={96}
              height={96}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6" />
          )}

          {busy ? (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-5 animate-spin text-brand-600" />
            </span>
          ) : null}
        </label>

        <div className="min-w-0 flex-1">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-ink-700"
            >
              <UploadCloud className="size-3.5" />
              Bilgisayardan yükle
            </button>

            {value ? (
              <button
                type="button"
                onClick={() => setValue("")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-500 transition hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="size-3.5" />
                Kaldır
              </button>
            ) : null}
          </div>

          <p className="mt-1.5 text-xs text-ink-400">
            {error ? <span className="text-red-600">{error}</span> : (hint ?? "PNG, JPG veya WEBP. Otomatik olarak küçültülür.")}
          </p>
        </div>
      </div>
    </div>
  );
}

type GalleryProps = {
  name: string;
  defaultValue?: string[];
  label?: string;
};

export function GalleryUpload({ name, defaultValue = [], label }: GalleryProps) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");

    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadImage(file));
      setItems((current) => [...current, ...urls]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Görseller yüklenemedi.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label ? <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span> : null}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="flex flex-wrap gap-3">
        {items.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative size-24 overflow-hidden rounded-2xl border border-ink-200">
            <Image src={url} alt="" width={96} height={96} unoptimized className="size-full object-cover" />
            <button
              type="button"
              onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
              className="absolute inset-x-0 bottom-0 bg-ink-900/80 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
            >
              Kaldır
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="grid size-24 place-items-center rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50 text-ink-400 transition hover:border-brand-400 hover:text-brand-600"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-6" />}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <p className="mt-1.5 text-xs text-ink-400">
        {error ? <span className="text-red-600">{error}</span> : "Birden fazla görsel seçebilirsin. İlk görsel kapak olarak kullanılır."}
      </p>
    </div>
  );
}

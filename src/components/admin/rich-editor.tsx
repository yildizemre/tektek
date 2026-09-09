"use client";

import {
  Bold,
  Eye,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Pencil,
  Quote,
  Table,
} from "lucide-react";
import { marked } from "marked";
import { useMemo, useRef, useState } from "react";

import { uploadImage } from "./image-upload";

marked.setOptions({ gfm: true, breaks: true });

type Props = {
  name: string;
  defaultValue?: string;
  label?: string;
  hint?: string;
  rows?: number;
};

type Tool = {
  icon: typeof Bold;
  title: string;
  before: string;
  after?: string;
  block?: boolean;
};

const TOOLS: Tool[] = [
  { icon: Bold, title: "Kalın", before: "**", after: "**" },
  { icon: Italic, title: "İtalik", before: "*", after: "*" },
  { icon: Heading2, title: "Başlık", before: "## ", block: true },
  { icon: List, title: "Madde listesi", before: "- ", block: true },
  { icon: ListOrdered, title: "Numaralı liste", before: "1. ", block: true },
  { icon: Quote, title: "Alıntı", before: "> ", block: true },
  { icon: Link2, title: "Bağlantı", before: "[", after: "](https://)" },
];

const TABLE_SNIPPET = `
| Özellik | Değer |
| --- | --- |
| Ekran | 1.96 inç AMOLED |
| Pil | 7 gün |
`;

export function RichEditor({ name, defaultValue = "", label, hint, rows = 16 }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const html = useMemo(
    () => (preview ? (marked.parse(value, { async: false }) as string) : ""),
    [preview, value],
  );

  function insert(before: string, after = "", block = false) {
    const area = areaRef.current;
    if (!area) return;

    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = value.slice(start, end);

    const prefix = block && start > 0 && value[start - 1] !== "\n" ? "\n" : "";
    const next = `${value.slice(0, start)}${prefix}${before}${selected}${after}${value.slice(end)}`;

    setValue(next);
    requestAnimationFrame(() => {
      area.focus();
      const caret = start + prefix.length + before.length + selected.length;
      area.setSelectionRange(caret, caret);
    });
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);

    try {
      const url = await uploadImage(file);
      insert(`\n![${file.name.replace(/\.\w+$/, "")}](${url})\n`, "", true);
    } catch {
      insert("", "");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label ? <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span> : null}
      <input type="hidden" name={name} value={value} />

      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="flex flex-wrap items-center gap-1 border-b border-ink-100 bg-ink-50 px-2 py-1.5">
          {TOOLS.map((tool) => (
            <button
              key={tool.title}
              type="button"
              title={tool.title}
              onClick={() => insert(tool.before, tool.after, tool.block)}
              className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-white hover:text-ink-900"
            >
              <tool.icon className="size-4" />
            </button>
          ))}

          <button
            type="button"
            title="Tablo ekle"
            onClick={() => insert(TABLE_SNIPPET, "", true)}
            className="grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-white hover:text-ink-900"
          >
            <Table className="size-4" />
          </button>

          <button
            type="button"
            title="Görsel yükle"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-white hover:text-ink-900"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            Görsel
          </button>

          <button
            type="button"
            onClick={() => setPreview((current) => !current)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-white hover:text-ink-900"
          >
            {preview ? <Pencil className="size-4" /> : <Eye className="size-4" />}
            {preview ? "Düzenle" : "Önizleme"}
          </button>
        </div>

        {preview ? (
          <div
            className="rich-text max-h-[32rem] overflow-y-auto px-4 py-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <textarea
            ref={areaRef}
            rows={rows}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full resize-y px-4 py-3 font-mono text-[13px] leading-relaxed text-ink-800 outline-none"
            placeholder={"## Başlık\n\nAçıklama metni...\n\n- Özellik 1\n- Özellik 2"}
          />
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleImage(event.target.files?.[0])}
      />

      <p className="mt-1.5 text-xs text-ink-400">
        {hint ?? "Kalın, başlık, liste, tablo ve görsel ekleyebilirsin. Yazdığın her şey ürün sayfasında bu şekilde görünür."}
      </p>
    </div>
  );
}

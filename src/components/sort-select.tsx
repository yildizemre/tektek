"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Önerilen sıralama" },
  { value: "newest", label: "En yeniler" },
  { value: "price-asc", label: "Artan fiyat" },
  { value: "price-desc", label: "Azalan fiyat" },
  { value: "popular", label: "En çok değerlendirilen" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (event.target.value) params.set("sirala", event.target.value);
    else params.delete("sirala");
    params.delete("sayfa");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={searchParams.get("sirala") ?? ""}
      onChange={handleChange}
      className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-ink-900"
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

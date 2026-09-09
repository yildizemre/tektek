const VARIABLES: { key: string; variable: string; fallback: string; suffix?: string }[] = [
  { key: "theme_primary", variable: "--c-primary", fallback: "#4f46e5" },
  { key: "theme_primary_text", variable: "--c-primary-text", fallback: "#ffffff" },
  { key: "theme_page_bg", variable: "--c-page-bg", fallback: "#ffffff" },
  { key: "theme_text", variable: "--c-text", fallback: "#0b0d18" },
  { key: "theme_header_bg", variable: "--c-header-bg", fallback: "#0b0d18" },
  { key: "theme_header_text", variable: "--c-header-text", fallback: "#ffffff" },
  { key: "theme_announcement_bg", variable: "--c-ann-bg", fallback: "#facc15" },
  { key: "theme_announcement_text", variable: "--c-ann-text", fallback: "#111827" },
  { key: "theme_footer_bg", variable: "--c-footer-bg", fallback: "#f6f6f7" },
  { key: "theme_footer_text", variable: "--c-footer-text", fallback: "#0b0d18" },
  { key: "theme_radius", variable: "--c-radius", fallback: "24", suffix: "px" },
];

const SAFE_VALUE = /^[#a-zA-Z0-9(),.%\s-]+$/;

/** Turns the saved settings into a `:root { ... }` block for the store shell. */
export function themeStyle(settings: Record<string, string>): string {
  const declarations = VARIABLES.map(({ key, variable, fallback, suffix }) => {
    const raw = (settings[key] ?? "").trim() || fallback;
    const value = SAFE_VALUE.test(raw) ? raw : fallback;
    return `${variable}:${value}${suffix ?? ""}`;
  });

  return `:root{${declarations.join(";")}}`;
}

export const THEME_PRESETS: { name: string; values: Record<string, string> }[] = [
  {
    name: "Gece Mavisi (varsayılan)",
    values: {
      theme_primary: "#4f46e5",
      theme_primary_text: "#ffffff",
      theme_page_bg: "#ffffff",
      theme_text: "#0b0d18",
      theme_header_bg: "#0b0d18",
      theme_header_text: "#ffffff",
      theme_announcement_bg: "#facc15",
      theme_announcement_text: "#111827",
      theme_footer_bg: "#f6f6f7",
      theme_footer_text: "#0b0d18",
    },
  },
  {
    name: "Turuncu Enerji",
    values: {
      theme_primary: "#ea580c",
      theme_primary_text: "#ffffff",
      theme_page_bg: "#ffffff",
      theme_text: "#1c1917",
      theme_header_bg: "#1c1917",
      theme_header_text: "#ffffff",
      theme_announcement_bg: "#fb923c",
      theme_announcement_text: "#1c1917",
      theme_footer_bg: "#fff7ed",
      theme_footer_text: "#1c1917",
    },
  },
  {
    name: "Yeşil Doğal",
    values: {
      theme_primary: "#059669",
      theme_primary_text: "#ffffff",
      theme_page_bg: "#ffffff",
      theme_text: "#052e2b",
      theme_header_bg: "#052e2b",
      theme_header_text: "#ffffff",
      theme_announcement_bg: "#34d399",
      theme_announcement_text: "#052e2b",
      theme_footer_bg: "#ecfdf5",
      theme_footer_text: "#052e2b",
    },
  },
  {
    name: "Kırmızı Fırsat",
    values: {
      theme_primary: "#dc2626",
      theme_primary_text: "#ffffff",
      theme_page_bg: "#ffffff",
      theme_text: "#18181b",
      theme_header_bg: "#18181b",
      theme_header_text: "#ffffff",
      theme_announcement_bg: "#fecaca",
      theme_announcement_text: "#7f1d1d",
      theme_footer_bg: "#fafafa",
      theme_footer_text: "#18181b",
    },
  },
  {
    name: "Mor Premium",
    values: {
      theme_primary: "#7c3aed",
      theme_primary_text: "#ffffff",
      theme_page_bg: "#ffffff",
      theme_text: "#1e1b4b",
      theme_header_bg: "#2e1065",
      theme_header_text: "#ffffff",
      theme_announcement_bg: "#ddd6fe",
      theme_announcement_text: "#2e1065",
      theme_footer_bg: "#faf5ff",
      theme_footer_text: "#1e1b4b",
    },
  },
];

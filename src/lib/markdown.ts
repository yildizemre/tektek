import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

const DANGEROUS = /<\s*(script|iframe|object|embed|style|link|meta)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|iframe|object|embed|style|link|meta)[^>]*\/?>/gi;
const EVENT_ATTRS = /\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JS_URLS = /(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi;

/**
 * Descriptions and pages are authored by staff in the admin panel, so we render
 * markdown (plus inline HTML) but still strip the obvious injection vectors.
 */
export function renderMarkdown(input: string | null | undefined): string {
  if (!input) return "";

  const html = marked.parse(input, { async: false }) as string;

  return html
    .replace(DANGEROUS, "")
    .replace(EVENT_ATTRS, "")
    .replace(JS_URLS, "");
}

export function markdownExcerpt(input: string | null | undefined, length = 160): string {
  if (!input) return "";
  return input
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, length);
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPageBySlug, getSettings } from "@/lib/queries";
import { markdownExcerpt, renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || !page.is_active) return { title: "Sayfa bulunamadı" };

  return {
    title: page.seo_title || page.title,
    description: page.seo_description || markdownExcerpt(page.body),
    alternates: { canonical: `/sayfa/${page.slug}` },
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page || !page.is_active) notFound();

  const settings = await getSettings();

  return (
    <article className="container-page max-w-3xl space-y-6 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">{page.title}</h1>

      <div
        className="rich-text text-sm leading-relaxed text-ink-500"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }}
      />

      {slug === "iletisim" && (
        <div className="grid gap-3 rounded-3xl border border-ink-100 p-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">E-posta</p>
            <p className="font-semibold">{settings.support_email}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Telefon</p>
            <p className="font-semibold">{settings.support_phone}</p>
          </div>
        </div>
      )}
    </article>
  );
}

import { deleteFaqAction, deletePageAction, submitFaqAction, submitPageAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RichEditor } from "@/components/admin/rich-editor";
import { getFaqs, getPages } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "İçerik" };

const FIELD = "w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm";

export default async function AdminContentPage() {
  const [pages, faqs] = await Promise.all([getPages(false), getFaqs(false)]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Sayfalar ve SSS</h1>

      <form action={submitPageAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Yeni / güncel sayfa</h2>
        <input name="title" required placeholder="Başlık" className={FIELD} />
        <input name="slug" placeholder="hakkimizda" className={FIELD} />
        <RichEditor name="body" rows={10} />
        <input name="seo_title" placeholder="SEO başlık" className={FIELD} />
        <textarea name="seo_description" rows={2} placeholder="SEO açıklama" className={FIELD} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Yayında</label>
        <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Sayfayı kaydet</button>
      </form>

      <div className="rounded-3xl border border-ink-100 bg-white">
        {pages.map((page) => (
          <div key={page.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{page.title}</p>
              <p className="text-xs text-ink-400">/sayfa/{page.slug}</p>
            </div>
            <DeleteButton id={page.id} action={deletePageAction} confirmText="Sayfa silinsin mi?" />
          </div>
        ))}
      </div>

      <form action={submitFaqAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">SSS ekle</h2>
        <input name="question" required placeholder="Soru" className={FIELD} />
        <textarea name="answer" required rows={3} placeholder="Cevap" className={FIELD} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Yayında</label>
        <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Soruyu kaydet</button>
      </form>

      <div className="rounded-3xl border border-ink-100 bg-white">
        {faqs.map((faq) => (
          <div key={faq.id} className="flex items-start gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{faq.question}</p>
              <p className="text-sm text-ink-500">{faq.answer}</p>
            </div>
            <DeleteButton id={faq.id} action={deleteFaqAction} confirmText="Soru silinsin mi?" />
          </div>
        ))}
      </div>
    </div>
  );
}

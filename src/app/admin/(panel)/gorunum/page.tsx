import { deleteMenuLinkAction, deleteSlideAction, submitMenuLinkAction, submitSlideAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { ImageUpload } from "@/components/admin/image-upload";
import { SettingsForm } from "@/components/admin/settings-form";
import { getMenuLinks, getSettings, listSlides } from "@/lib/queries";
import { MENU_SECTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Görünüm" };

const FIELD = "w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm";

export default async function AdminAppearancePage() {
  const [settings, slides, links] = await Promise.all([getSettings(), listSlides(), getMenuLinks(false)]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Görünüm</h1>
      <p className="text-sm text-ink-400">Kayan yazı, renkler, logo, footer slaytları ve menü bağlantıları.</p>

      <SettingsForm settings={settings} />

      <form action={submitSlideAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Footer slayt ekle</h2>
        <ImageUpload name="image_url" label="Görsel" />
        <input name="title" placeholder="Başlık" className={FIELD} />
        <input name="subtitle" placeholder="Alt yazı" className={FIELD} />
        <input name="link" placeholder="Tıklanınca gidilecek adres (/kategori/...)" className={FIELD} />
        <input type="hidden" name="position" value="footer" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Aktif</label>
        <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Slaytı kaydet</button>
      </form>

      <div className="rounded-3xl border border-ink-100 bg-white">
        {slides.map((slide) => (
          <div key={slide.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{slide.title || "Görsel"}</p>
              <p className="text-xs text-ink-400">{slide.link}</p>
            </div>
            <DeleteButton id={slide.id} action={deleteSlideAction} confirmText="Slayt silinsin mi?" />
          </div>
        ))}
      </div>

      <form action={submitMenuLinkAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
        <h2 className="text-sm font-bold">Footer bağlantısı</h2>
        <select name="section" className={FIELD}>
          {MENU_SECTIONS.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}
        </select>
        <input name="label" required placeholder="Etiket" className={FIELD} />
        <input name="href" required placeholder="/sayfa/hakkimizda" className={FIELD} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Aktif</label>
        <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Bağlantıyı kaydet</button>
      </form>

      <div className="rounded-3xl border border-ink-100 bg-white">
        {links.map((link) => (
          <div key={link.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{link.label}</p>
              <p className="text-xs text-ink-400">{link.section} · {link.href}</p>
            </div>
            <DeleteButton id={link.id} action={deleteMenuLinkAction} confirmText="Bağlantı silinsin mi?" />
          </div>
        ))}
      </div>
    </div>
  );
}

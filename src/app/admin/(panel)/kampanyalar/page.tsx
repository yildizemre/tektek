import { deleteCampaignAction, deleteCouponAction, submitCampaignAction, submitCouponAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllCategories, getCampaigns, getCoupons, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kampanya ve kupon" };

const FIELD = "w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm";

export default async function AdminCampaignsPage() {
  const [coupons, campaigns, products, categories] = await Promise.all([
    getCoupons(),
    getCampaigns(),
    getProducts({ includeInactive: true, limit: 200 }),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Kampanya ve kupon</h1>

      <section className="grid gap-6 xl:grid-cols-2">
        <form action={submitCouponAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">İndirim / referans kodu</h2>
          <input name="code" required placeholder="HOSGELDIN" className={FIELD} />
          <input name="description" placeholder="Açıklama" className={FIELD} />
          <div className="grid grid-cols-2 gap-2">
            <select name="type" className={FIELD}>
              <option value="percent">Yüzde</option>
              <option value="fixed">Sabit TL</option>
            </select>
            <input name="value" type="number" step="0.01" placeholder="Değer" className={FIELD} />
          </div>
          <input name="min_total" type="number" placeholder="Min. sepet" className={FIELD} />
          <select name="product_id" className={FIELD}>
            <option value="">Tüm ürünler</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <select name="category_id" className={FIELD}>
            <option value="">Tüm kategoriler</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Aktif</label>
          <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Kodu kaydet</button>
        </form>

        <form action={submitCampaignAction} className="space-y-3 rounded-3xl border border-ink-100 bg-white p-6">
          <h2 className="text-sm font-bold">Toplu kampanya</h2>
          <input name="name" required placeholder="Bahar indirimi" className={FIELD} />
          <input name="discount_percent" type="number" placeholder="İndirim %" className={FIELD} />
          <input name="badge" placeholder="Rozet (ör. Fırsat)" className={FIELD} />
          <select name="scope" className={FIELD}>
            <option value="all">Tüm mağaza</option>
            <option value="category">Kategori</option>
            <option value="product">Tek ürün</option>
          </select>
          <select name="target_id" className={FIELD}>
            <option value="">Hedef (kategori/ürün)</option>
            {categories.map((category) => <option key={`c${category.id}`} value={category.id}>K: {category.name}</option>)}
            {products.map((product) => <option key={`p${product.id}`} value={product.id}>Ü: {product.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input name="starts_at" type="date" className={FIELD} />
            <input name="ends_at" type="date" className={FIELD} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Aktif</label>
          <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white">Kampanyayı kaydet</button>
        </form>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-bold">Kodlar</h2>
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{coupon.code}</p>
              <p className="text-xs text-ink-400">{coupon.description} · {coupon.type === "percent" ? `%${coupon.value}` : `${coupon.value} TL`}</p>
            </div>
            <DeleteButton id={coupon.id} action={deleteCouponAction} confirmText="Kod silinsin mi?" />
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white">
        <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-bold">Kampanyalar</h2>
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="flex items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <p className="font-bold">{campaign.name}</p>
              <p className="text-xs text-ink-400">%{campaign.discount_percent} · {campaign.scope}</p>
            </div>
            <DeleteButton id={campaign.id} action={deleteCampaignAction} confirmText="Kampanya silinsin mi?" />
          </div>
        ))}
      </section>
    </div>
  );
}

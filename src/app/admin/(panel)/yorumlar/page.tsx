import { deleteReviewAction, submitReviewAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { getProducts, listReviews } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yorumlar" };

const FIELD = "w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([listReviews(), getProducts({ includeInactive: true, limit: 200 })]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Yorumlar</h1>

      <form action={submitReviewAction} className="grid gap-3 rounded-3xl border border-ink-100 bg-white p-6 md:grid-cols-2">
        <select name="product_id" required className={FIELD}>
          <option value="">Ürün seç</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <input name="author" required placeholder="Yazar adı" className={FIELD} />
        <input name="title" placeholder="Başlık" className={FIELD} />
        <input name="rating" type="number" min="1" max="5" defaultValue="5" className={FIELD} />
        <textarea name="body" rows={3} placeholder="Yorum" className={`${FIELD} md:col-span-2`} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_approved" defaultChecked /> Onaylı</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" /> Anasayfada göster</label>
        <button className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white md:col-span-2">Yorum ekle</button>
      </form>

      <div className="divide-y divide-ink-50 overflow-hidden rounded-3xl border border-ink-100 bg-white">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-3 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{review.author} · {review.rating}/5</p>
              <p className="text-xs text-ink-400">{review.product_name}</p>
              <p className="mt-1 text-sm">{review.title}</p>
              <p className="text-sm text-ink-500">{review.body}</p>
            </div>
            <DeleteButton id={review.id} action={deleteReviewAction} confirmText="Yorum silinsin mi?" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { deleteUserAction, toggleUserAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatPrice } from "@/lib/format";
import { listUsers } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const metadata = { title: "Üyeler" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const term = typeof query.q === "string" ? query.q : "";
  const users = await listUsers(term || undefined);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Üyeler</h1>
      <form action="/admin/uyeler" className="max-w-md">
        <input name="q" defaultValue={term} placeholder="İsim, e-posta, telefon" className="w-full rounded-full border border-ink-200 px-4 py-2.5 text-sm" />
      </form>
      <div className="divide-y divide-ink-50 overflow-hidden rounded-3xl border border-ink-100 bg-white">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{user.name}</p>
              <p className="text-xs text-ink-400">{user.email} · {user.phone}</p>
            </div>
            <span className="text-xs text-ink-400">{user.order_count} sipariş · {formatPrice(user.total_spent)}</span>
            <form action={toggleUserAction}>
              <input type="hidden" name="id" value={user.id} />
              <input type="hidden" name="is_active" value={user.is_active ? 0 : 1} />
              <button className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold">
                {user.is_active ? "Askıya al" : "Aktifleştir"}
              </button>
            </form>
            <DeleteButton id={user.id} action={deleteUserAction} confirmText="Üye silinsin mi?" />
          </div>
        ))}
      </div>
    </div>
  );
}

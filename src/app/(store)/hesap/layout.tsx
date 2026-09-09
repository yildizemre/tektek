import Link from "next/link";
import { Package, User } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit space-y-4 rounded-3xl border border-ink-100 p-5">
        <div>
          <p className="text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-ink-400">{user.email}</p>
        </div>

        <nav className="space-y-1 text-sm font-semibold">
          <Link href="/hesap" className="flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-ink-50">
            <User className="size-4" /> Hesabım
          </Link>
          <Link href="/hesap/siparislerim" className="flex items-center gap-2 rounded-2xl px-3 py-2 hover:bg-ink-50">
            <Package className="size-4" /> Siparişlerim
          </Link>
        </nav>

        <form action={logoutAction}>
          <button type="submit" className="w-full rounded-full border border-ink-200 py-2.5 text-sm font-semibold">
            Çıkış yap
          </button>
        </form>
      </aside>

      <div>{children}</div>
    </div>
  );
}

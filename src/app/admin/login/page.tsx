import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yönetici girişi" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const next = typeof query.devam === "string" ? query.devam : "/admin";

  return (
    <div className="grid min-h-dvh place-items-center bg-ink-900 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8">
        <div className="space-y-1 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-black text-white">
            E
          </span>
          <h1 className="pt-3 text-xl font-extrabold tracking-tight">Yönetim Paneli</h1>
          <p className="text-sm text-ink-400">Devam etmek için giriş yapın.</p>
        </div>

        <LoginForm next={next} />
      </div>
    </div>
  );
}

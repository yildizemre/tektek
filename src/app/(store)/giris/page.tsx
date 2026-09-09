import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Giriş yap" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "user") redirect("/hesap");

  const query = await searchParams;
  const next = typeof query.devam === "string" ? query.devam : "/hesap";

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-ink-100 bg-white p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">Giriş yap</h1>
          <p className="text-sm text-ink-400">Siparişlerini görmek ve daha hızlı alışveriş yapmak için giriş yap.</p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}

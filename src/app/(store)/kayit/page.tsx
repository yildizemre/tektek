import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth-form";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Üye ol" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "user") redirect("/hesap");

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-ink-100 bg-white p-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">Üye ol</h1>
          <p className="text-sm text-ink-400">E-posta adresinle üye ol, siparişlerini ve durumunu buradan takip et.</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

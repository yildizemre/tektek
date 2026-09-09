import { AccountPasswordForm, ProfileForm } from "@/components/account-forms";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const user = await requireUser();
  const { password_hash: _hash, ...profile } = user;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Hesabım</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileForm user={profile} />
        <AccountPasswordForm />
      </div>
    </div>
  );
}

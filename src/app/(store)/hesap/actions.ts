"use server";

import { revalidatePath } from "next/cache";

import { changeUserPassword, requireUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/queries";

export type AccountState = { error?: string; success?: string };

export async function updateProfileAction(
  _prev: AccountState,
  data: FormData,
): Promise<AccountState> {
  const user = await requireUser();

  await updateUserProfile(user.id, {
    name: String(data.get("name") ?? "").trim() || user.name,
    phone: String(data.get("phone") ?? "").trim(),
    address: String(data.get("address") ?? "").trim(),
    city: String(data.get("city") ?? "").trim(),
    district: String(data.get("district") ?? "").trim(),
  });

  revalidatePath("/hesap");
  return { success: "Bilgilerin güncellendi." };
}

export async function changeAccountPasswordAction(
  _prev: AccountState,
  data: FormData,
): Promise<AccountState> {
  const user = await requireUser();
  const error = await changeUserPassword(
    user.id,
    String(data.get("currentPassword") ?? ""),
    String(data.get("newPassword") ?? ""),
  );

  if (error) return { error };
  return { success: "Şifren güncellendi." };
}

"use server";

import { redirect } from "next/navigation";

import { register, signIn, signOut } from "@/lib/auth";
import { addSubscriber } from "@/lib/queries";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Geçerli bir e-posta adresi girin." };
  }

  await addSubscriber(email);
  return { status: "success", message: "Kaydın alındı! Kampanyalardan ilk sen haberdar olacaksın." };
}

export type AuthState = { error?: string };

export async function loginAction(_prev: AuthState, data: FormData): Promise<AuthState> {
  const identifier = String(data.get("email") ?? "");
  const password = String(data.get("password") ?? "");
  const next = String(data.get("next") ?? "").trim();

  const result = await signIn(identifier, password);
  if ("error" in result) return { error: result.error };

  if (result.role === "admin") {
    redirect(next.startsWith("/admin") ? next : "/admin");
  }

  redirect(next.startsWith("/") && !next.startsWith("//") ? next || "/hesap" : "/hesap");
}

export async function registerAction(_prev: AuthState, data: FormData): Promise<AuthState> {
  const result = await register({
    email: String(data.get("email") ?? ""),
    name: String(data.get("name") ?? ""),
    phone: String(data.get("phone") ?? ""),
    password: String(data.get("password") ?? ""),
  });

  if ("error" in result) return { error: result.error };
  redirect("/hesap");
}

export async function logoutAction() {
  await signOut();
  redirect("/");
}

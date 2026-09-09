"use server";

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

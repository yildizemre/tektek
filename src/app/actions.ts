"use server";

import { redirect } from "next/navigation";

import { revalidatePath } from "next/cache";

import { getSession, register, signIn, signOut } from "@/lib/auth";
import { addSubscriber, getProductById, saveReview } from "@/lib/queries";

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

export type ReviewState = { status: "idle" | "success" | "error"; message: string };

/** Müşteri yorumu: onaylanana kadar sitede görünmez. Fotoğraflar yalnızca kendi medya adresimizden kabul edilir. */
export async function submitCustomerReviewAction(_prev: ReviewState, data: FormData): Promise<ReviewState> {
  // Botlar için gizli alan
  if (String(data.get("website") ?? "")) return { status: "success", message: "Yorumun alındı, teşekkürler!" };

  const productId = Number(data.get("product_id"));
  const product = Number.isFinite(productId) ? await getProductById(productId) : null;
  if (!product) return { status: "error", message: "Ürün bulunamadı." };

  const author = String(data.get("author") ?? "").trim().slice(0, 60);
  const body = String(data.get("body") ?? "").trim().slice(0, 2000);
  const title = String(data.get("title") ?? "").trim().slice(0, 120);
  const rating = Math.min(5, Math.max(1, Math.floor(Number(data.get("rating")) || 5)));

  if (author.length < 2) return { status: "error", message: "Lütfen adını yaz." };
  if (body.length < 5) return { status: "error", message: "Lütfen birkaç kelimeyle deneyimini yaz." };

  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(data.get("images") ?? "[]"));
    if (Array.isArray(parsed)) images = parsed.map(String).filter((url) => /^\/api\/media\/\d+$/.test(url)).slice(0, 5);
  } catch {
    images = [];
  }

  const session = await getSession().catch(() => null);

  await saveReview({
    product_id: product.id,
    user_id: session?.role === "user" ? Number(session.sub) : null,
    author,
    rating,
    title,
    body,
    image_url: images[0] ?? "",
    images: JSON.stringify(images),
    is_approved: 0,
    is_featured: 0,
  });

  revalidatePath("/admin/yorumlar");
  return { status: "success", message: "Yorumun alındı, teşekkürler! Onaylandıktan sonra yayınlanacak." };
}

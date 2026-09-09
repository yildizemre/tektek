"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { changePassword, requireAdmin, signIn, signOut } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  deleteCategory,
  deleteOrder,
  deleteProduct,
  saveCategory,
  saveProduct,
  updateOrderStatus,
  updateSettings,
} from "@/lib/queries";

export type FormState = { error?: string; success?: string };

function text(data: FormData, key: string): string {
  return String(data.get(key) ?? "").trim();
}

function number(data: FormData, key: string, fallback = 0): number {
  const value = Number(String(data.get(key) ?? "").replace(",", "."));
  return Number.isFinite(value) ? value : fallback;
}

function checkbox(data: FormData, key: string): number {
  return data.get(key) ? 1 : 0;
}

function lines(data: FormData, key: string): string {
  return JSON.stringify(
    text(data, key)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

/* -------------------------------------------------------------------- auth */

export async function loginAction(_prev: FormState, data: FormData): Promise<FormState> {
  const email = text(data, "email");
  const password = String(data.get("password") ?? "");

  if (!email || !password) return { error: "E-posta ve şifre gerekli." };

  const error = await signIn(email, password);
  if (error) return { error };

  const next = text(data, "next") || "/admin";
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, data: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const error = await changePassword(
    admin.sub,
    String(data.get("currentPassword") ?? ""),
    String(data.get("newPassword") ?? ""),
  );

  if (error) return { error };
  return { success: "Şifreniz güncellendi." };
}

/* ---------------------------------------------------------------- products */

export async function saveProductAction(_prev: FormState, data: FormData): Promise<FormState> {
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Ürün adı zorunlu." };

  const price = number(data, "price");
  if (price <= 0) return { error: "Geçerli bir fiyat girin." };

  const compareAt = number(data, "compare_at_price");
  const idValue = text(data, "id");
  const categoryId = text(data, "category_id");

  try {
    await saveProduct({
      id: idValue ? Number(idValue) : undefined,
      name,
      slug: text(data, "slug") ? slugify(text(data, "slug")) : slugify(name),
      sku: text(data, "sku"),
      short_description: text(data, "short_description"),
      description: text(data, "description"),
      price,
      compare_at_price: compareAt > 0 ? compareAt : null,
      stock: Math.max(0, Math.floor(number(data, "stock"))),
      category_id: categoryId ? Number(categoryId) : null,
      image_url: text(data, "image_url"),
      gallery: lines(data, "gallery"),
      features: lines(data, "features"),
      is_active: checkbox(data, "is_active"),
      is_featured: checkbox(data, "is_featured"),
      sort_order: Math.floor(number(data, "sort_order")),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return { error: "Bu URL (slug) başka bir üründe kullanılıyor." };
    return { error: "Ürün kaydedilemedi. Bilgileri kontrol edin." };
  }

  revalidatePath("/admin/urunler");
  redirect("/admin/urunler?durum=kaydedildi");
}

export async function deleteProductAction(data: FormData) {
  await requireAdmin();
  await deleteProduct(Number(data.get("id")));
  revalidatePath("/admin/urunler");
}

/* -------------------------------------------------------------- categories */

export async function saveCategoryAction(_prev: FormState, data: FormData): Promise<FormState> {
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Kategori adı zorunlu." };

  const idValue = text(data, "id");
  const parentId = text(data, "parent_id");

  try {
    await saveCategory({
      id: idValue ? Number(idValue) : undefined,
      name,
      slug: text(data, "slug") ? slugify(text(data, "slug")) : slugify(name),
      description: text(data, "description"),
      image_url: text(data, "image_url"),
      accent: text(data, "accent") || "slate",
      icon: text(data, "icon") || "package",
      parent_id: parentId ? Number(parentId) : null,
      sort_order: Math.floor(number(data, "sort_order")),
      is_active: checkbox(data, "is_active"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return { error: "Bu URL (slug) başka bir kategoride kullanılıyor." };
    return { error: "Kategori kaydedilemedi." };
  }

  revalidatePath("/admin/kategoriler");
  redirect("/admin/kategoriler?durum=kaydedildi");
}

export async function deleteCategoryAction(data: FormData) {
  await requireAdmin();
  await deleteCategory(Number(data.get("id")));
  revalidatePath("/admin/kategoriler");
}

/* ------------------------------------------------------------------ orders */

export async function updateOrderStatusAction(data: FormData) {
  await requireAdmin();
  const id = Number(data.get("id"));
  await updateOrderStatus(id, String(data.get("status") ?? "pending"));
  revalidatePath(`/admin/siparisler/${id}`);
  revalidatePath("/admin/siparisler");
}

export async function deleteOrderAction(data: FormData) {
  await requireAdmin();
  await deleteOrder(Number(data.get("id")));
  revalidatePath("/admin/siparisler");
  redirect("/admin/siparisler");
}

/* ---------------------------------------------------------------- settings */

const SETTING_KEYS = [
  "site_name",
  "site_tagline",
  "hero_title",
  "hero_subtitle",
  "hero_cta_text",
  "hero_cta_link",
  "announcements",
  "free_shipping_threshold",
  "shipping_cost",
  "support_phone",
  "support_email",
  "whatsapp_number",
  "footer_text",
  "stat_customers",
  "stat_satisfaction",
  "stat_rating",
];

export async function saveSettingsAction(_prev: FormState, data: FormData): Promise<FormState> {
  await requireAdmin();

  const values: Record<string, string> = {};
  for (const key of SETTING_KEYS) {
    if (data.has(key)) values[key] = text(data, key);
  }

  await updateSettings(values);
  revalidatePath("/", "layout");

  return { success: "Ayarlar kaydedildi." };
}

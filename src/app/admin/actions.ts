"use server";

import { revalidatePath } from "next/cache";

import { bustCatalog } from "@/lib/memo";
import { redirect } from "next/navigation";

import { changeAdminPassword, hashPassword, requireAdmin, signOut } from "@/lib/auth";
import { slugify } from "@/lib/format";
import {
  createAdmin,
  deleteAdmin,
  deleteCampaign,
  deleteCategory,
  deleteCoupon,
  deleteFaq,
  deleteMedia,
  deleteMenuLink,
  deleteOrder,
  deletePage,
  deleteProduct,
  deleteReview,
  deleteSlide,
  deleteUser,
  saveCampaign,
  saveCategory,
  saveCoupon,
  saveFaq,
  saveMenuLink,
  savePage,
  saveProduct,
  saveReview,
  saveSlide,
  setUserActive,
  updateOrderAdminFields,
  updateSettings,
  replaceTiers,
  replaceVariants,
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

function asFormData(prevOrData: FormState | FormData, maybeData?: FormData): FormData {
  if (prevOrData instanceof FormData) return prevOrData;
  if (maybeData instanceof FormData) return maybeData;
  throw new Error("Form verisi eksik.");
}

function nullableId(data: FormData, key: string): number | null {
  const value = text(data, key);
  return value ? Number(value) : null;
}

function refreshStore() {
  bustCatalog();
  revalidatePath("/", "layout");
}

export async function logoutAction() {
  await signOut();
  redirect("/giris");
}

export async function changePasswordAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  const admin = await requireAdmin();
  const error = await changeAdminPassword(
    admin.sub,
    String(data.get("currentPassword") ?? ""),
    String(data.get("newPassword") ?? ""),
  );
  if (error) return { error };
  return { success: "Şifreniz güncellendi." };
}

export async function saveProductAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();

  const name = text(data, "name");
  if (!name) return { error: "Ürün adı zorunlu." };

  const price = number(data, "price");
  if (price <= 0) return { error: "Geçerli bir fiyat girin." };

  const compareAt = number(data, "compare_at_price");
  const idValue = text(data, "id");
  const categoryId = nullableId(data, "category_id");
  const extra = data.getAll("extra_category_ids").map((value) => Number(value)).filter(Boolean);

  let gallery = text(data, "gallery");
  try {
    const parsed = JSON.parse(gallery || "[]");
    gallery = Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify(
      gallery.split("\n").map((line) => line.trim()).filter(Boolean),
    );
  } catch {
    gallery = JSON.stringify(gallery.split("\n").map((line) => line.trim()).filter(Boolean));
  }

  const features = JSON.stringify(
    text(data, "features").split("\n").map((line) => line.trim()).filter(Boolean),
  );

  try {
    const productId = await saveProduct(
      {
        id: idValue ? Number(idValue) : undefined,
        name,
        slug: text(data, "slug") ? slugify(text(data, "slug")) : slugify(name),
        sku: text(data, "sku"),
        brand: text(data, "brand"),
        short_description: text(data, "short_description"),
        description: text(data, "description"),
        price,
        compare_at_price: compareAt > 0 ? compareAt : null,
        stock: Math.max(0, Math.floor(number(data, "stock"))),
        category_id: categoryId,
        image_url: text(data, "image_url"),
        gallery,
        features,
        is_active: checkbox(data, "is_active"),
        is_featured: checkbox(data, "is_featured"),
        sort_order: Math.floor(number(data, "sort_order")),
        seo_title: text(data, "seo_title"),
        seo_description: text(data, "seo_description"),
      },
      extra,
    );

    const variantNames = data.getAll("variant_name").map(String);
    const variants = variantNames
      .map((variantName, index) => ({
        name: variantName.trim(),
        color_hex: String(data.getAll("variant_hex")[index] ?? "").trim(),
        image_url: String(data.getAll("variant_image")[index] ?? "").trim(),
        price_diff: Number(String(data.getAll("variant_diff")[index] ?? "0").replace(",", ".")) || 0,
        stock: Math.floor(Number(data.getAll("variant_stock")[index] ?? 0) || 0),
        sort_order: index,
      }))
      .filter((variant) => variant.name);

    await replaceVariants(productId, variants);

    const tierQty = data.getAll("tier_qty").map(String);
    const tiers = tierQty
      .map((qty, index) => ({
        quantity: Math.max(2, Math.floor(Number(qty) || 0)),
        discount_percent: Number(String(data.getAll("tier_discount")[index] ?? "0").replace(",", ".")) || 0,
        badge: String(data.getAll("tier_badge")[index] ?? "").trim(),
        sort_order: index,
      }))
      .filter((tier) => tier.quantity >= 2 && tier.discount_percent > 0);

    await replaceTiers(productId, tiers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return { error: "Bu URL (slug) başka bir üründe kullanılıyor." };
    return { error: "Ürün kaydedilemedi." };
  }

  refreshStore();
  revalidatePath("/admin/urunler");
  redirect("/admin/urunler?durum=kaydedildi");
}

export async function deleteProductAction(data: FormData) {
  await requireAdmin();
  await deleteProduct(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/urunler");
}

export async function saveCategoryAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  const name = text(data, "name");
  if (!name) return { error: "Kategori adı zorunlu." };

  try {
    await saveCategory({
      id: text(data, "id") ? Number(text(data, "id")) : undefined,
      name,
      slug: text(data, "slug") ? slugify(text(data, "slug")) : slugify(name),
      description: text(data, "description"),
      image_url: text(data, "image_url"),
      accent: text(data, "accent") || "slate",
      icon: text(data, "icon") || "package",
      parent_id: nullableId(data, "parent_id"),
      sort_order: Math.floor(number(data, "sort_order")),
      is_active: checkbox(data, "is_active"),
      show_on_home: checkbox(data, "show_on_home"),
      seo_title: text(data, "seo_title"),
      seo_description: text(data, "seo_description"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("UNIQUE")) return { error: "Bu URL başka bir kategoride kullanılıyor." };
    return { error: "Kategori kaydedilemedi." };
  }

  refreshStore();
  redirect("/admin/kategoriler?durum=kaydedildi");
}

export async function deleteCategoryAction(data: FormData) {
  await requireAdmin();
  await deleteCategory(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/kategoriler");
}

export async function updateOrderAction(data: FormData) {
  await requireAdmin();
  const id = Number(data.get("id"));
  await updateOrderAdminFields(id, {
    status: String(data.get("status") ?? "pending"),
    payment_status: String(data.get("payment_status") ?? "pending"),
    tracking_number: text(data, "tracking_number"),
    carrier: text(data, "carrier"),
    admin_note: text(data, "admin_note"),
  });
  revalidatePath(`/admin/siparisler/${id}`);
  revalidatePath("/admin/siparisler");
}

export async function deleteOrderAction(data: FormData) {
  await requireAdmin();
  await deleteOrder(Number(data.get("id")));
  revalidatePath("/admin/siparisler");
  redirect("/admin/siparisler");
}

export async function saveSettingsAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string" && key !== "intent") values[key] = value.trim();
  }
  for (const key of [
    "announcements_enabled",
    "whatsapp_enabled",
    "hero_enabled",
    "show_footer_slider",
    "show_categories",
    "show_featured",
    "show_bestsellers",
    "show_new",
    "show_stats",
    "show_reviews",
    "show_faq",
  ]) {
    values[key] = data.get(key) ? "1" : "0";
  }
  await updateSettings(values);
  refreshStore();
  return { success: "Ayarlar kaydedildi." };
}

export async function saveReviewAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  await saveReview({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    product_id: nullableId(data, "product_id"),
    user_id: null,
    author: text(data, "author") || "Müşteri",
    rating: Math.min(5, Math.max(1, Math.floor(number(data, "rating", 5)))),
    title: text(data, "title"),
    body: text(data, "body"),
    image_url: text(data, "image_url"),
    is_approved: checkbox(data, "is_approved"),
    is_featured: checkbox(data, "is_featured"),
  });
  refreshStore();
  revalidatePath("/admin/yorumlar");
  return { success: "Yorum kaydedildi." };
}

export async function deleteReviewAction(data: FormData) {
  await requireAdmin();
  await deleteReview(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/yorumlar");
}

export async function saveCouponAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  const code = text(data, "code").toUpperCase();
  if (!code) return { error: "Kod gerekli." };

  await saveCoupon({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    code,
    description: text(data, "description"),
    type: text(data, "type") === "fixed" ? "fixed" : "percent",
    value: number(data, "value"),
    min_total: number(data, "min_total"),
    product_id: nullableId(data, "product_id"),
    category_id: nullableId(data, "category_id"),
    max_uses: Math.floor(number(data, "max_uses")),
    starts_at: text(data, "starts_at"),
    ends_at: text(data, "ends_at"),
    is_active: checkbox(data, "is_active"),
  });
  revalidatePath("/admin/kampanyalar");
  return { success: "İndirim kodu kaydedildi." };
}

export async function deleteCouponAction(data: FormData) {
  await requireAdmin();
  await deleteCoupon(Number(data.get("id")));
  revalidatePath("/admin/kampanyalar");
}

export async function saveCampaignAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  await saveCampaign({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    name: text(data, "name"),
    discount_percent: number(data, "discount_percent"),
    scope: (text(data, "scope") || "all") as "all" | "category" | "product",
    target_id: nullableId(data, "target_id"),
    badge: text(data, "badge"),
    starts_at: text(data, "starts_at"),
    ends_at: text(data, "ends_at"),
    is_active: checkbox(data, "is_active"),
  });
  refreshStore();
  revalidatePath("/admin/kampanyalar");
  return { success: "Kampanya kaydedildi." };
}

export async function deleteCampaignAction(data: FormData) {
  await requireAdmin();
  await deleteCampaign(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/kampanyalar");
}

export async function saveSlideAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  await saveSlide({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    position: text(data, "position") || "footer",
    title: text(data, "title"),
    subtitle: text(data, "subtitle"),
    image_url: text(data, "image_url"),
    link: text(data, "link"),
    sort_order: Math.floor(number(data, "sort_order")),
    is_active: checkbox(data, "is_active"),
  });
  refreshStore();
  revalidatePath("/admin/gorunum");
  return { success: "Slayt kaydedildi." };
}

export async function deleteSlideAction(data: FormData) {
  await requireAdmin();
  await deleteSlide(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/gorunum");
}

export async function saveMenuLinkAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  await saveMenuLink({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    section: text(data, "section") || "footer1",
    label: text(data, "label"),
    href: text(data, "href") || "/",
    sort_order: Math.floor(number(data, "sort_order")),
    is_active: checkbox(data, "is_active"),
  });
  refreshStore();
  revalidatePath("/admin/gorunum");
  return { success: "Bağlantı kaydedildi." };
}

export async function deleteMenuLinkAction(data: FormData) {
  await requireAdmin();
  await deleteMenuLink(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/gorunum");
}

export async function savePageAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  const title = text(data, "title");
  if (!title) return { error: "Başlık gerekli." };

  const pageId = Number(text(data, "id"));
  await savePage({
    id: pageId > 0 ? pageId : undefined,
    slug: text(data, "slug") ? slugify(text(data, "slug")) : slugify(title),
    title,
    body: text(data, "body"),
    seo_title: text(data, "seo_title"),
    seo_description: text(data, "seo_description"),
    is_active: checkbox(data, "is_active"),
    sort_order: Math.floor(number(data, "sort_order")),
  });
  refreshStore();
  revalidatePath("/admin/icerik");
  return { success: "Sayfa kaydedildi." };
}

export async function deletePageAction(data: FormData) {
  await requireAdmin();
  await deletePage(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/icerik");
}

export async function saveFaqAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  await saveFaq({
    id: text(data, "id") ? Number(text(data, "id")) : undefined,
    question: text(data, "question"),
    answer: text(data, "answer"),
    sort_order: Math.floor(number(data, "sort_order")),
    is_active: checkbox(data, "is_active"),
  });
  refreshStore();
  revalidatePath("/admin/icerik");
  return { success: "Soru kaydedildi." };
}

export async function deleteFaqAction(data: FormData) {
  await requireAdmin();
  await deleteFaq(Number(data.get("id")));
  refreshStore();
  revalidatePath("/admin/icerik");
}

export async function toggleUserAction(data: FormData) {
  await requireAdmin();
  await setUserActive(Number(data.get("id")), Number(data.get("is_active")));
  revalidatePath("/admin/uyeler");
}

export async function deleteUserAction(data: FormData) {
  await requireAdmin();
  await deleteUser(Number(data.get("id")));
  revalidatePath("/admin/uyeler");
}

export async function createStaffAction(prevOrData: FormState | FormData, maybeData?: FormData): Promise<FormState> {
  const data = asFormData(prevOrData, maybeData);
  await requireAdmin();
  const email = text(data, "email").toLowerCase();
  const password = String(data.get("password") ?? "");
  if (!email || password.length < 6) return { error: "Kullanıcı adı ve en az 6 karakter şifre gerekli." };

  try {
    await createAdmin({
      email,
      name: text(data, "name") || email,
      passwordHash: await hashPassword(password),
      role: text(data, "role") || "staff",
    });
  } catch {
    return { error: "Bu kullanıcı adı zaten kayıtlı." };
  }

  revalidatePath("/admin/ayarlar");
  return { success: "Yönetici hesabı oluşturuldu." };
}

export async function deleteStaffAction(data: FormData) {
  const admin = await requireAdmin();
  const id = Number(data.get("id"));
  if (String(id) === admin.sub) return;
  await deleteAdmin(id);
  revalidatePath("/admin/ayarlar");
}

export async function deleteMediaAction(data: FormData) {
  await requireAdmin();
  await deleteMedia(Number(data.get("id")));
  revalidatePath("/admin/gorunum");
}

export async function submitReviewAction(data: FormData): Promise<void> {
  await saveReviewAction(data);
}

export async function submitCouponAction(data: FormData): Promise<void> {
  await saveCouponAction(data);
}

export async function submitCampaignAction(data: FormData): Promise<void> {
  await saveCampaignAction(data);
}

export async function submitSlideAction(data: FormData): Promise<void> {
  await saveSlideAction(data);
}

export async function submitMenuLinkAction(data: FormData): Promise<void> {
  await saveMenuLinkAction(data);
}

export async function submitPageAction(data: FormData): Promise<void> {
  await savePageAction(data);
}

export async function submitFaqAction(data: FormData): Promise<void> {
  await saveFaqAction(data);
}

export async function submitStaffAction(data: FormData): Promise<void> {
  await createStaffAction(data);
}

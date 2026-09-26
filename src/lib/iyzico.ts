import "server-only";

import { createHmac, randomBytes } from "node:crypto";

import type { Order, OrderItem } from "./types";

const SANDBOX_URI = "https://sandbox-api.iyzipay.com";
const INIT_PATH = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const RETRIEVE_PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function baseUrl() {
  return (process.env.IYZICO_BASE_URL || SANDBOX_URI).replace(/\/$/, "");
}

function money(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts.slice(0, -1).join(" "), surname: parts.at(-1)! };
}

function authorization(path: string, body: string) {
  const apiKey = process.env.IYZICO_API_KEY ?? "";
  const secretKey = process.env.IYZICO_SECRET_KEY ?? "";
  const randomKey = `${Date.now()}${randomBytes(8).toString("hex")}`;
  const signature = createHmac("sha256", secretKey)
    .update(randomKey + path + body)
    .digest("hex");
  const encoded = Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`).toString(
    "base64",
  );

  return {
    Authorization: `IYZWSv2 ${encoded}`,
    "x-iyzi-rnd": randomKey,
    "Content-Type": "application/json",
  };
}

async function postIyzico(path: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const body = JSON.stringify(payload);

  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      method: "POST",
      headers: authorization(path, body),
      body,
    });
    const data = (await response.json()) as Record<string, unknown>;
    return data;
  } catch (error) {
    return {
      status: "failure",
      errorMessage: error instanceof Error ? error.message : "iyzico bağlantı hatası",
    };
  }
}

export type CheckoutInitResult =
  | { ok: true; token: string; paymentPageUrl?: string; checkoutFormContent: string }
  | { ok: false; error: string };

export async function initCheckoutForm(
  order: Order,
  items: OrderItem[],
  callbackUrl: string,
): Promise<CheckoutInitResult> {
  const { name, surname } = splitName(order.customer_name);

  const basketItems = items.map((item) => ({
    id: String(item.product_id ?? item.id),
    name: item.name.slice(0, 100),
    category1: "Teknoloji",
    itemType: "PHYSICAL",
    price: money(item.price * item.quantity),
  }));

  if (order.shipping_cost > 0) {
    basketItems.push({
      id: "shipping",
      name: "Kargo",
      category1: "Kargo",
      itemType: "PHYSICAL",
      price: money(order.shipping_cost),
    });
  }

  const basketTotal = basketItems.reduce((sum, item) => sum + Number(item.price), 0);
  const paidTotal = Math.max(0, Number(order.total) || basketTotal);

  const address = {
    contactName: order.customer_name,
    city: order.city || "İstanbul",
    country: "Turkey",
    address: `${order.address} ${order.district}`.trim(),
    zipCode: order.zip_code || "34000",
  };

  const result = await postIyzico(INIT_PATH, {
    locale: "tr",
    conversationId: order.conversation_id,
    price: money(basketTotal),
    paidPrice: money(paidTotal),
    currency: "TRY",
    basketId: order.code,
    paymentGroup: "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: `B${order.id}`,
      name,
      surname,
      gsmNumber: normalizePhone(order.phone),
      email: order.email,
      identityNumber: order.identity_number || "11111111111",
      registrationAddress: order.address,
      ip: "85.34.78.112",
      city: order.city || "İstanbul",
      country: "Turkey",
      zipCode: order.zip_code || "34000",
    },
    shippingAddress: address,
    billingAddress: address,
    basketItems,
  });

  if (result.status !== "success") {
    return {
      ok: false,
      error: String(result.errorMessage ?? "iyzico ödeme formu başlatılamadı."),
    };
  }

  return {
    ok: true,
    token: String(result.token ?? ""),
    paymentPageUrl: result.paymentPageUrl ? String(result.paymentPageUrl) : undefined,
    checkoutFormContent: String(result.checkoutFormContent ?? ""),
  };
}

export type CheckoutRetrieveResult = {
  success: boolean;
  paymentId: string;
  conversationId: string;
  basketId: string;
  message: string;
};

export async function retrieveCheckoutForm(token: string): Promise<CheckoutRetrieveResult> {
  const result = await postIyzico(RETRIEVE_PATH, { locale: "tr", token });
  const success = result.status === "success" && result.paymentStatus === "SUCCESS";

  return {
    success,
    paymentId: String(result.paymentId ?? ""),
    conversationId: String(result.conversationId ?? ""),
    basketId: String(result.basketId ?? ""),
    message: success ? "Ödeme başarılı" : String(result.errorMessage ?? "Ödeme tamamlanamadı."),
  };
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+9${digits}`;
  return `+90${digits}`;
}

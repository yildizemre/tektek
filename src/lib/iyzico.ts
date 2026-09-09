import "server-only";

import Iyzipay from "iyzipay";

import type { Order, OrderItem } from "./types";

const SANDBOX_URI = "https://sandbox-api.iyzipay.com";

export function isIyzicoConfigured(): boolean {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

function client(): Iyzipay {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY ?? "",
    secretKey: process.env.IYZICO_SECRET_KEY ?? "",
    uri: process.env.IYZICO_BASE_URL ?? SANDBOX_URI,
  });
}

function money(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts.slice(0, -1).join(" "), surname: parts.at(-1)! };
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

  // iyzico rejects the request unless `price` equals the sum of the basket items.
  const basketTotal = basketItems.reduce((sum, item) => sum + Number(item.price), 0);

  const address = {
    contactName: order.customer_name,
    city: order.city || "İstanbul",
    country: "Turkey",
    address: `${order.address} ${order.district}`.trim(),
    zipCode: order.zip_code || "34000",
  };

  const request: Record<string, unknown> = {
    locale: "tr",
    conversationId: order.conversation_id,
    price: money(basketTotal),
    paidPrice: money(basketTotal),
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
  };

  const result = await callIyzico((cb) => client().checkoutFormInitialize.create(request, cb));

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
  const result = await callIyzico((cb) => client().checkoutForm.retrieve({ locale: "tr", token }, cb));
  const success = result.status === "success" && result.paymentStatus === "SUCCESS";

  return {
    success,
    paymentId: String(result.paymentId ?? ""),
    conversationId: String(result.conversationId ?? ""),
    basketId: String(result.basketId ?? ""),
    message: success ? "Ödeme başarılı" : String(result.errorMessage ?? "Ödeme tamamlanamadı."),
  };
}

type IyzicoCallback = (err: unknown, result: Record<string, unknown>) => void;

async function callIyzico(
  invoke: (callback: IyzicoCallback) => void,
): Promise<Record<string, unknown>> {
  try {
    return await new Promise<Record<string, unknown>>((resolve, reject) => {
      invoke((err, res) => (err ? reject(err) : resolve(res)));
    });
  } catch (error) {
    return {
      status: "failure",
      errorMessage: error instanceof Error ? error.message : "iyzico bağlantı hatası",
    };
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90")) return `+${digits}`;
  if (digits.startsWith("0")) return `+9${digits}`;
  return `+90${digits}`;
}

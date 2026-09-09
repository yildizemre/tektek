import { createClient } from "@libsql/client/web";
import Iyzipay from "iyzipay";

function present(name: string) {
  const value = process.env[name] ?? "";
  return value.trim().length > 0;
}

const required = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "AUTH_SECRET",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_BASE_URL",
  "NEXT_PUBLIC_SITE_URL",
];

console.log("=== Ortam ===");
for (const key of required) {
  console.log(`${present(key) ? "OK" : "EKSIK"}  ${key}`);
}
console.log("SITE", process.env.NEXT_PUBLIC_SITE_URL);
console.log("IYZICO_HOST", process.env.IYZICO_BASE_URL);
console.log("AUTH_SECRET_WEAK", process.env.AUTH_SECRET?.includes("gecici") ? "evet" : "hayir");

console.log("\n=== Turso ===");
try {
  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const tables = await turso.execute(
    "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('products','orders','settings')",
  );
  const products = await turso.execute("SELECT COUNT(*) AS n FROM products");
  console.log("baglanti OK");
  console.log("temel tablolar", tables.rows[0]);
  console.log("urun sayisi", products.rows[0]);
} catch (error) {
  console.log("Turso HATA", error instanceof Error ? error.message : error);
}

console.log("\n=== iyzico (kart cekilmez) ===");
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY ?? "",
  secretKey: process.env.IYZICO_SECRET_KEY ?? "",
  uri: process.env.IYZICO_BASE_URL ?? "https://api.iyzipay.com",
});

const request = {
  locale: "tr",
  conversationId: `check-${Date.now()}`,
  price: "1.00",
  paidPrice: "1.00",
  currency: "TRY",
  basketId: "CHECK1",
  paymentGroup: "PRODUCT",
  callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/iyzico/callback`,
  enabledInstallments: [1, 2, 3, 6, 9],
  buyer: {
    id: "BY1",
    name: "Test",
    surname: "Kontrol",
    gsmNumber: "+905338664138",
    email: "kontrol@tekteknoloji.net",
    identityNumber: "11111111111",
    registrationAddress: "Test mahalle",
    ip: "85.34.78.112",
    city: "Istanbul",
    country: "Turkey",
    zipCode: "34000",
  },
  shippingAddress: {
    contactName: "Test Kontrol",
    city: "Istanbul",
    country: "Turkey",
    address: "Test mahalle",
    zipCode: "34000",
  },
  billingAddress: {
    contactName: "Test Kontrol",
    city: "Istanbul",
    country: "Turkey",
    address: "Test mahalle",
    zipCode: "34000",
  },
  basketItems: [
    {
      id: "1",
      name: "Kontrol",
      category1: "Teknoloji",
      itemType: "PHYSICAL",
      price: "1.00",
    },
  ],
};

const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
  iyzipay.checkoutFormInitialize.create(request, (err: unknown, res: Record<string, unknown>) => {
    if (err) reject(err);
    else resolve(res);
  });
});

console.log("status", result.status);
console.log("errorCode", result.errorCode ?? "-");
console.log("errorMessage", result.errorMessage ?? "-");
console.log("token", result.token ? "var" : "yok");
console.log("paymentPageUrl", result.paymentPageUrl ? "var" : "yok");
console.log("checkoutFormContent", result.checkoutFormContent ? "var" : "yok");

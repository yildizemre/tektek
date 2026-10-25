import "server-only";

import nodemailer from "nodemailer";

import { formatPrice } from "./format";
import type { Order, OrderItem } from "./types";
import { PAYMENT_METHOD_LABELS } from "./types";

/** Yeni sipariş bildiriminin gideceği adresler. ORDER_NOTIFY_EMAILS ile değiştirilebilir (virgülle). */
const DEFAULT_NOTIFY = "deximdestek@gmail.com";

function transport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass },
  });
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Sipariş oluştuğunda mağaza sahibine e-posta atar. Hata siparişi asla bozmaz. */
export async function sendNewOrderEmail(order: Order, items: Pick<OrderItem, "name" | "price" | "quantity">[]) {
  try {
    const mailer = transport();
    if (!mailer) {
      console.warn("[mail] SMTP_USER / SMTP_PASS tanımlı değil, sipariş maili gönderilmedi.");
      return;
    }

    const to = (process.env.ORDER_NOTIFY_EMAILS || DEFAULT_NOTIFY)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const method = PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method;
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

    const rows = items
      .map(
        (item) =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${escape(item.name)}</td>` +
          `<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>` +
          `<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${formatPrice(item.price * item.quantity)}</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
        <h2 style="margin:0 0 12px">Yeni sipariş: ${escape(order.code)}</h2>
        <p style="margin:0 0 4px"><b>Ödeme:</b> ${escape(method)}</p>
        <p style="margin:0 0 4px"><b>Toplam:</b> ${formatPrice(order.total)}</p>
        <h3 style="margin:16px 0 6px">Müşteri</h3>
        <p style="margin:0">${escape(order.customer_name)}<br>${escape(order.phone)}<br>${escape(order.email)}</p>
        <p style="margin:6px 0 0">${escape(order.address)}<br>${escape([order.district, order.city].filter(Boolean).join(" / "))}</p>
        ${order.note ? `<p style="margin:6px 0 0"><b>Not:</b> ${escape(order.note)}</p>` : ""}
        <h3 style="margin:16px 0 6px">Ürünler</h3>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        ${site ? `<p style="margin:16px 0 0"><a href="${site}/admin/siparisler/${order.id}">Siparişi panelde aç</a></p>` : ""}
      </div>`;

    await mailer.sendMail({
      from: `"Tek Teknoloji" <${process.env.SMTP_USER}>`,
      to,
      subject: `Yeni sipariş ${order.code} · ${formatPrice(order.total)} · ${method}`,
      html,
    });
  } catch (error) {
    console.error("[mail] Sipariş maili gönderilemedi:", error);
  }
}

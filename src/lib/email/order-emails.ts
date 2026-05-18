import { env } from "@/lib/env";
import { isSmtpConfigured, serverEnv } from "@/lib/env.server";
import { formatCurrency } from "@/lib/utils/format";
import type { Order } from "@/types/order";

import { getMailTransporter } from "./transporter";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  transferred: "Accepted",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function buildItemsHtml(order: Order): string {
  const { code, locale } = env.currency;

  return order.items
    .map((item) => {
      const lineTotal = formatCurrency(item.unitPrice * item.quantity, code, locale);

      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name} × ${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${lineTotal}</td>
      </tr>`;
    })
    .join("");
}

function buildOrderEmailHtml(order: Order, headline: string, message: string): string {
  const { code, locale } = env.currency;
  const total = formatCurrency(order.total, code, locale);
  const trackUrl = `${serverEnv.appUrl}/track-order?orderId=${encodeURIComponent(order.id)}`;

  return `
    <div style="font-family:system-ui,sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;">
      <h1 style="font-size:20px;margin-bottom:8px;">${headline}</h1>
      <p style="color:#555;line-height:1.5;">${message}</p>
      <div style="margin:24px 0;padding:16px;background:#f8f8f8;border-radius:8px;">
        <p style="margin:0 0 4px;font-size:13px;color:#666;">Order number</p>
        <p style="margin:0;font-size:18px;font-weight:600;font-family:monospace;">${order.orderNumber}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#666;">Order ID</p>
        <p style="margin:0;font-size:14px;font-family:monospace;">${order.id}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#666;">Status</p>
        <p style="margin:0;font-weight:600;">${STATUS_LABELS[order.status]}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;font-size:13px;color:#666;">Item</th>
            <th style="text-align:right;padding-bottom:8px;font-size:13px;color:#666;">Amount</th>
          </tr>
        </thead>
        <tbody>${buildItemsHtml(order)}</tbody>
      </table>
      <p style="font-size:16px;font-weight:600;text-align:right;">Total: ${total}</p>
      <h2 style="font-size:16px;margin-top:24px;">Delivery</h2>
      <p style="color:#555;line-height:1.5;">
        ${order.customer.name}<br />
        ${order.customer.addressLine1}<br />
        ${order.customer.city}${order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}<br />
        ${order.customer.phone}
      </p>
      <p style="margin-top:24px;">
        <a href="${trackUrl}" style="color:#2563eb;">Track your order</a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#888;">Payment: Cash on delivery</p>
    </div>
  `;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[email] SMTP is not configured — skipping order confirmation email.");
    return;
  }

  const transporter = getMailTransporter();

  if (!transporter) {
    return;
  }

  const storeName = env.storeName;
  const subject = `${storeName} — Order confirmation ${order.orderNumber}`;
  const html = buildOrderEmailHtml(
    order,
    "Thank you for your order!",
    `Hi ${order.customer.name}, we received your order and will contact you when it is accepted for delivery.`,
  );

  const text = [
    `Hi ${order.customer.name},`,
    "",
    `Thank you for your order!`,
    `Order number: ${order.orderNumber}`,
    `Order ID: ${order.id}`,
    `Status: ${STATUS_LABELS[order.status]}`,
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `- ${item.name} × ${item.quantity}: ${formatCurrency(item.unitPrice * item.quantity, env.currency.code, env.currency.locale)}`,
    ),
    "",
    `Total: ${formatCurrency(order.total, env.currency.code, env.currency.locale)}`,
    "",
    `Track your order: ${serverEnv.appUrl}/track-order?orderId=${encodeURIComponent(order.id)}`,
    "",
    "Payment: Cash on delivery",
  ].join("\n");

  await transporter.sendMail({
    from: serverEnv.smtp.from,
    to: order.customer.email,
    subject,
    text,
    html,
  });
}

export async function sendOrderAcceptedEmail(order: Order): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[email] SMTP is not configured — skipping order accepted email.");
    return;
  }

  const transporter = getMailTransporter();

  if (!transporter) {
    return;
  }

  const storeName = env.storeName;
  const subject = `${storeName} — Your order ${order.orderNumber} has been accepted`;
  const html = buildOrderEmailHtml(
    order,
    "Your order has been accepted",
    `Hi ${order.customer.name}, great news! We've accepted your order and it's being prepared for delivery.`,
  );

  const text = [
    `Hi ${order.customer.name},`,
    "",
    `Your order ${order.orderNumber} (ID: ${order.id}) has been accepted.`,
    `Status: ${STATUS_LABELS[order.status]}`,
    "",
    "Items:",
    ...order.items.map(
      (item) =>
        `- ${item.name} × ${item.quantity}: ${formatCurrency(item.unitPrice * item.quantity, env.currency.code, env.currency.locale)}`,
    ),
    "",
    `Total: ${formatCurrency(order.total, env.currency.code, env.currency.locale)}`,
    "",
    `Track: ${serverEnv.appUrl}/track-order?orderId=${encodeURIComponent(order.id)}`,
  ].join("\n");

  await transporter.sendMail({
    from: serverEnv.smtp.from,
    to: order.customer.email,
    subject,
    text,
    html,
  });
}

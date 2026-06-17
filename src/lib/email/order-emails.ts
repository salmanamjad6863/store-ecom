import { env } from "@/lib/env";
import { isSmtpConfigured, serverEnv } from "@/lib/env.server";
import { formatCurrency } from "@/lib/utils/format";
import type { Order, OrderItem } from "@/types/order";

import { getMailTransporter } from "./transporter";

const BRAND = {
  cream: "#faf6f1",
  blush: "#e8c4b8",
  rose: "#c97b6b",
  deep: "#2b1a14",
  warm: "#7c4a3a",
  soft: "#f0e8e0",
  white: "#ffffff",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatOrderItemTitle(item: OrderItem): string {
  return item.name;
}

function formatOrderItemVariant(item: OrderItem): string | null {
  const parts = [item.colorName, item.modelName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function buildItemsHtml(order: Order): string {
  const { code, locale } = env.currency;

  return order.items
    .map((item) => {
      const lineTotal = formatCurrency(item.unitPrice * item.quantity, code, locale);
      const title = escapeHtml(formatOrderItemTitle(item));
      const variant = formatOrderItemVariant(item);
      const variantHtml = variant
        ? `<p style="margin:4px 0 0;font-size:13px;color:${BRAND.warm};line-height:1.4;">${escapeHtml(variant)}</p>`
        : "";
      const imageHtml = item.image
        ? `<td style="width:88px;padding:12px 12px 12px 0;vertical-align:top;">
            <div style="width:72px;height:108px;border-radius:12px;border:1px solid ${BRAND.soft};background:${BRAND.cream};padding:6px;box-sizing:border-box;">
              <img src="${escapeHtml(item.image)}" alt="" width="60" height="96" style="display:block;width:100%;height:100%;object-fit:contain;" />
            </div>
          </td>`
        : "";

      return `<tr>
        ${imageHtml}
        <td style="padding:12px 0;vertical-align:top;border-bottom:1px solid ${BRAND.soft};">
          <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.deep};font-family:Georgia,'Times New Roman',serif;">${title}</p>
          ${variantHtml}
          <p style="margin:6px 0 0;font-size:12px;color:${BRAND.warm};">Qty ${item.quantity}</p>
        </td>
        <td style="padding:12px 0;vertical-align:top;text-align:right;border-bottom:1px solid ${BRAND.soft};white-space:nowrap;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${BRAND.deep};">${lineTotal}</p>
        </td>
      </tr>`;
    })
    .join("");
}

type OrderEmailOptions = {
  headline: string;
  message: string;
  confirmationBadge?: string;
  showStatus?: boolean;
};

function buildOrderEmailHtml(order: Order, options: OrderEmailOptions): string {
  const { code, locale } = env.currency;
  const storeName = escapeHtml(env.storeName);
  const total = formatCurrency(order.total, code, locale);
  const trackUrl = `${serverEnv.appUrl}/track-order?orderId=${encodeURIComponent(order.id)}`;
  const customerName = escapeHtml(order.customer.name);
  const headline = escapeHtml(options.headline);
  const message = escapeHtml(options.message);
  const badge = options.confirmationBadge
    ? `<div style="margin:0 0 24px;padding:14px 18px;background:${BRAND.soft};border:1px solid ${BRAND.blush};border-radius:12px;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.rose};">${escapeHtml(options.confirmationBadge)}</p>
      </div>`
    : "";

  const statusBlock =
    options.showStatus === true
      ? `<p style="margin:12px 0 0;font-size:13px;color:${BRAND.warm};">Status</p>
         <p style="margin:0;font-size:14px;font-weight:600;color:${BRAND.deep};text-transform:capitalize;">${escapeHtml(order.status)}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.deep};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.cream};">
      <tr>
        <td align="center" style="padding:32px 16px 48px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${BRAND.white};border-radius:20px;overflow:hidden;border:1px solid ${BRAND.soft};box-shadow:0 18px 50px rgba(43,26,20,0.08);">
            <tr>
              <td style="padding:36px 32px 28px;background:linear-gradient(135deg, ${BRAND.deep} 0%, #3d2417 55%, ${BRAND.warm} 100%);text-align:center;">
                <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.1;color:${BRAND.cream};">${storeName}</p>
                <p style="margin:0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.blush};">${headline}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px;">
                ${badge}
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.deep};">Hi ${customerName},</p>
                <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${BRAND.warm};">${message}</p>

                <div style="margin:0 0 28px;padding:20px;background:${BRAND.cream};border-radius:14px;border:1px solid ${BRAND.soft};">
                  <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.warm};">Order number</p>
                  <p style="margin:0;font-size:20px;font-weight:700;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${BRAND.deep};">${escapeHtml(order.orderNumber)}</p>
                  <p style="margin:14px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.warm};">Order ID</p>
                  <p style="margin:0;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${BRAND.deep};word-break:break-all;">${escapeHtml(order.id)}</p>
                  ${statusBlock}
                </div>

                <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.warm};">Your items</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;">
                  <tbody>${buildItemsHtml(order)}</tbody>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;">
                  <tr>
                    <td style="padding-top:8px;border-top:2px solid ${BRAND.blush};"></td>
                  </tr>
                  <tr>
                    <td align="right" style="padding-top:12px;">
                      <p style="margin:0;font-size:18px;font-weight:700;color:${BRAND.deep};font-family:Georgia,'Times New Roman',serif;">Total: ${total}</p>
                      <p style="margin:6px 0 0;font-size:12px;color:${BRAND.warm};">Cash on delivery</p>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.warm};">Delivery</p>
                <p style="margin:0 0 28px;font-size:14px;line-height:1.7;color:${BRAND.deep};">
                  ${customerName}<br />
                  ${escapeHtml(order.customer.addressLine1)}<br />
                  ${escapeHtml(order.customer.city)}${order.customer.postalCode ? `, ${escapeHtml(order.customer.postalCode)}` : ""}<br />
                  ${escapeHtml(order.customer.phone)}
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td style="border-radius:999px;background:${BRAND.rose};">
                      <a href="${trackUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;letter-spacing:0.02em;">Track your order</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;background:${BRAND.cream};border-top:1px solid ${BRAND.soft};text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.warm};">Thank you for shopping with ${storeName}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildItemsText(order: Order): string[] {
  return order.items.map((item) => {
    const variant = formatOrderItemVariant(item);
    const lineTotal = formatCurrency(
      item.unitPrice * item.quantity,
      env.currency.code,
      env.currency.locale,
    );
    const details = variant ? ` (${variant})` : "";
    return `- ${formatOrderItemTitle(item)}${details} × ${item.quantity}: ${lineTotal}`;
  });
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
  const html = buildOrderEmailHtml(order, {
    headline: "Thank you for your order",
    confirmationBadge: "Your order is confirmed",
    message:
      "We received your order and will contact you when it is accepted for delivery. Save your order ID below to track it anytime.",
  });

  const text = [
    `Hi ${order.customer.name},`,
    "",
    "Your order is confirmed.",
    `Order number: ${order.orderNumber}`,
    `Order ID: ${order.id}`,
    "",
    "Items:",
    ...buildItemsText(order),
    "",
    `Total: ${formatCurrency(order.total, env.currency.code, env.currency.locale)}`,
    "",
    "Delivery:",
    order.customer.name,
    order.customer.addressLine1,
    `${order.customer.city}${order.customer.postalCode ? `, ${order.customer.postalCode}` : ""}`,
    order.customer.phone,
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
  const html = buildOrderEmailHtml(order, {
    headline: "Your order has been accepted",
    confirmationBadge: "We're preparing your order",
    message:
      "Great news! We've accepted your order and it's being prepared for delivery.",
  });

  const text = [
    `Hi ${order.customer.name},`,
    "",
    `Your order ${order.orderNumber} (ID: ${order.id}) has been accepted.`,
    "",
    "Items:",
    ...buildItemsText(order),
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

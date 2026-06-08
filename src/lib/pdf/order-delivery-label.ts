import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import type { Order, OrderItem } from "@/types/order";

import { addRule, downloadMinimalPdf, wrapTextForLabel, type PdfTextLine } from "./minimal-pdf";

/** Compact label sized for phone-case parcels (~72 × 108 mm). */
const LABEL_WIDTH_MM = 72;
const LABEL_HEIGHT_MM = 108;
const MARGIN_MM = 5;
const CONTENT_WIDTH_MM = LABEL_WIDTH_MM - MARGIN_MM * 2;
const INDENT_MM = 2;

/** Helvetica Type1 only supports basic Latin — normalize text for clean PDF output. */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/×/g, "x")
    .replace(/·/g, " - ")
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

function lineHeightMm(fontSize: number): number {
  return fontSize * 0.48;
}

type LayoutLine = Omit<PdfTextLine, "yMm"> & { maxWidthMm?: number };

function layoutLines(
  startYMm: number,
  blocks: LayoutLine[],
): { lines: PdfTextLine[]; endYMm: number } {
  const lines: PdfTextLine[] = [];
  let y = startYMm;

  for (const block of blocks) {
    const size = block.size ?? 8;
    const maxWidth = block.maxWidthMm ?? CONTENT_WIDTH_MM;
    const wrapped = wrapTextForLabel(sanitizeForPdf(block.text), maxWidth, size);
    const step = lineHeightMm(size);

    for (const text of wrapped) {
      lines.push({
        text,
        xMm: block.xMm,
        yMm: y,
        size: block.size,
        bold: block.bold,
      });
      y += step;
    }
  }

  return { lines, endYMm: y };
}

function formatContentBlocks(items: OrderItem[]): LayoutLine[] {
  const blocks: LayoutLine[] = [];
  const visible = items.slice(0, 4);

  for (const item of visible) {
    blocks.push({
      text: `${item.quantity}x ${item.name}`,
      xMm: MARGIN_MM,
      size: 7,
      bold: true,
      maxWidthMm: CONTENT_WIDTH_MM,
    });

    const details = [item.modelName, item.colorName].filter(Boolean).join(" / ");

    if (details) {
      blocks.push({
        text: details,
        xMm: MARGIN_MM + INDENT_MM,
        size: 6,
        maxWidthMm: CONTENT_WIDTH_MM - INDENT_MM,
      });
    }

    blocks.push({
      text: " ",
      xMm: MARGIN_MM,
      size: 4,
      maxWidthMm: CONTENT_WIDTH_MM,
    });
  }

  if (items.length > 4) {
    blocks.push({
      text: `+${items.length - 4} more item(s)`,
      xMm: MARGIN_MM,
      size: 6,
      maxWidthMm: CONTENT_WIDTH_MM,
    });
  }

  return blocks;
}

function buildLabelContent(order: Order): {
  lines: PdfTextLine[];
  rules: ReturnType<typeof addRule>[];
} {
  const rules: ReturnType<typeof addRule>[] = [];
  const allLines: PdfTextLine[] = [];

  const placed = order.createdAt.toLocaleDateString(env.currency.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  let y = 8;

  const header = layoutLines(y, [
    { text: env.storeName.toUpperCase(), xMm: MARGIN_MM, size: 9, bold: true },
  ]);
  allLines.push(...header.lines);
  y = header.endYMm + 2;
  rules.push(addRule(y, MARGIN_MM, LABEL_WIDTH_MM));
  y += 3;

  const orderInfo = layoutLines(y, [
    { text: `Order ${order.orderNumber}`, xMm: MARGIN_MM, size: 7.5, bold: true },
    { text: placed, xMm: MARGIN_MM, size: 6.5 },
  ]);
  allLines.push(...orderInfo.lines);
  y = orderInfo.endYMm + 2;
  rules.push(addRule(y, MARGIN_MM, LABEL_WIDTH_MM));
  y += 3;

  const deliverTo = layoutLines(y, [
    { text: "DELIVER TO", xMm: MARGIN_MM, size: 6.5, bold: true },
    {
      text: order.customer.name,
      xMm: MARGIN_MM,
      size: 9,
      bold: true,
      maxWidthMm: CONTENT_WIDTH_MM,
    },
    {
      text: order.customer.phone,
      xMm: MARGIN_MM,
      size: 7.5,
      maxWidthMm: CONTENT_WIDTH_MM,
    },
    {
      text: order.customer.addressLine1,
      xMm: MARGIN_MM,
      size: 7,
      maxWidthMm: CONTENT_WIDTH_MM,
    },
    {
      text: [order.customer.city, order.customer.postalCode].filter(Boolean).join(", "),
      xMm: MARGIN_MM,
      size: 7,
      maxWidthMm: CONTENT_WIDTH_MM,
    },
  ]);
  allLines.push(...deliverTo.lines);
  y = deliverTo.endYMm + 2;
  rules.push(addRule(y, MARGIN_MM, LABEL_WIDTH_MM));
  y += 3;

  const contentsHeader = layoutLines(y, [
    { text: "CONTENTS", xMm: MARGIN_MM, size: 6.5, bold: true },
  ]);
  allLines.push(...contentsHeader.lines);
  y = contentsHeader.endYMm + 1.5;

  const contents = layoutLines(y, formatContentBlocks(order.items));
  allLines.push(...contents.lines);
  y = contents.endYMm + 2;
  rules.push(addRule(y, MARGIN_MM, LABEL_WIDTH_MM));
  y += 3;

  const total = sanitizeForPdf(
    formatCurrency(order.total, env.currency.code, env.currency.locale),
  );

  const payment = layoutLines(y, [
    { text: `COD: ${total}`, xMm: MARGIN_MM, size: 8, bold: true },
    { text: "Cash on delivery", xMm: MARGIN_MM, size: 6 },
  ]);
  allLines.push(...payment.lines);
  y = payment.endYMm + 2;

  if (order.customer.notes?.trim()) {
    const notes = layoutLines(y, [
      { text: "NOTES", xMm: MARGIN_MM, size: 6, bold: true },
      {
        text: order.customer.notes.trim(),
        xMm: MARGIN_MM,
        size: 6,
        maxWidthMm: CONTENT_WIDTH_MM,
      },
    ]);
    allLines.push(...notes.lines);
    y = notes.endYMm + 2;
  }

  allLines.push({
    text: "Attach to parcel - Handle with care",
    xMm: MARGIN_MM,
    yMm: LABEL_HEIGHT_MM - 6,
    size: 5.5,
  });

  return { lines: allLines, rules };
}

/** Generate and download a prefilled delivery label PDF (client-side only, not stored). */
export function downloadOrderDeliveryLabelPdf(order: Order): void {
  const { lines, rules } = buildLabelContent(order);

  downloadMinimalPdf({
    widthMm: LABEL_WIDTH_MM,
    heightMm: LABEL_HEIGHT_MM,
    lines,
    rules,
    filename: `delivery-${order.orderNumber}.pdf`,
  });
}

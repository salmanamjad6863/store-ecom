export type PdfTextLine = {
  text: string;
  xMm: number;
  yMm: number;
  size?: number;
  bold?: boolean;
};

type PdfLine = {
  x1Mm: number;
  y1Mm: number;
  x2Mm: number;
  y2Mm: number;
};

type MinimalPdfOptions = {
  widthMm: number;
  heightMm: number;
  lines: PdfTextLine[];
  rules?: PdfLine[];
  filename: string;
};

const MM_TO_PT = 72 / 25.4;

function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxWidthMm: number, fontSize: number): string[] {
  const approxCharWidthMm = fontSize * 0.22;
  const maxChars = Math.max(8, Math.floor(maxWidthMm / approxCharWidthMm));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    if (word.length > maxChars) {
      let chunk = "";
      for (const char of word) {
        if ((chunk + char).length > maxChars) {
          lines.push(chunk);
          chunk = char;
        } else {
          chunk += char;
        }
      }
      current = chunk;
    } else {
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [text];
}

export function wrapTextForLabel(text: string, maxWidthMm: number, fontSize: number): string[] {
  const trimmed = text.trim();

  if (!trimmed) {
    return [""];
  }

  return wrapText(trimmed, maxWidthMm, fontSize);
}

function buildContentStream(
  widthMm: number,
  heightMm: number,
  lines: PdfTextLine[],
  rules: PdfLine[],
): string {
  const parts: string[] = [];

  for (const rule of rules) {
    const x1 = mmToPt(rule.x1Mm);
    const y1 = mmToPt(heightMm - rule.y1Mm);
    const x2 = mmToPt(rule.x2Mm);
    const y2 = mmToPt(heightMm - rule.y2Mm);

    parts.push("0.35 w");
    parts.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m`);
    parts.push(`${x2.toFixed(2)} ${y2.toFixed(2)} l`);
    parts.push("S");
  }

  for (const line of lines) {
    const font = line.bold ? "/F2" : "/F1";
    const size = line.size ?? 8;
    const x = mmToPt(line.xMm);
    const y = mmToPt(heightMm - line.yMm);

    parts.push("BT");
    parts.push(`${font} ${size} Tf`);
    parts.push(`1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`);
    parts.push(`(${escapePdfText(line.text)}) Tj`);
    parts.push("ET");
  }

  return parts.join("\n");
}

export function downloadMinimalPdf({
  widthMm,
  heightMm,
  lines,
  rules = [],
  filename,
}: MinimalPdfOptions): void {
  const content = buildContentStream(widthMm, heightMm, lines, rules);
  const contentLength = content.length;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${mmToPt(widthMm).toFixed(2)} ${mmToPt(heightMm).toFixed(2)}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`,
    `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function addRule(yMm: number, marginMm: number, widthMm: number): PdfLine {
  return {
    x1Mm: marginMm,
    y1Mm: yMm,
    x2Mm: widthMm - marginMm,
    y2Mm: yMm,
  };
}

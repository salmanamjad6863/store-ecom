import { customAlphabet } from "nanoid";

const suffix = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);

/** Format: ORD-YYYYMMDD-XXXX */
export function generateOrderNumber(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `ORD-${year}${month}${day}-${suffix()}`;
}

/** Normalize phone for comparison (digits only). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phonesMatch(a: string, b: string): boolean {
  const normalizedA = normalizePhone(a);
  const normalizedB = normalizePhone(b);

  if (!normalizedA || !normalizedB) {
    return false;
  }

  if (normalizedA === normalizedB) {
    return true;
  }

  // Compare last 10 digits when country codes differ
  const minLength = 10;
  if (normalizedA.length >= minLength && normalizedB.length >= minLength) {
    return normalizedA.slice(-minLength) === normalizedB.slice(-minLength);
  }

  return false;
}

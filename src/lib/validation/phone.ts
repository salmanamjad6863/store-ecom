/** Normalize PK phone input: strip spaces, dashes, parentheses. */
export function normalizePkPhone(value: string): string {
  return value.replace(/[\s\-()]/g, "");
}

/**
 * Pakistani mobile: 03XXXXXXXXX or +923XXXXXXXXX (11 digits after country code).
 */
export function isValidPkPhone(value: string): boolean {
  const normalized = normalizePkPhone(value);

  if (/^03[0-9]{9}$/.test(normalized)) {
    return true;
  }

  if (/^\+923[0-9]{9}$/.test(normalized)) {
    return true;
  }

  if (/^923[0-9]{9}$/.test(normalized)) {
    return true;
  }

  return false;
}

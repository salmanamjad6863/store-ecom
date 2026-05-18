/** Format amount stored in minor units (e.g. paisa for PKR) as a currency string. */
export function formatCurrency(
  amountInMinorUnits: number,
  currency = "PKR",
  locale = "en-PK",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInMinorUnits / 100);
}

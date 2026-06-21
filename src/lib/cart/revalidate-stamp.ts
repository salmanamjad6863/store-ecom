const STORAGE_KEY = "cart-revalidated-at";
const FRESH_MS = 30_000;

export function markCartRevalidated(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
}

export function isCartRevalidationFresh(): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return false;
  }

  const timestamp = Number(raw);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < FRESH_MS;
}

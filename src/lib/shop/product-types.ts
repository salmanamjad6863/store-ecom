/** Collapse duplicate categories (e.g. "Toy" vs "Toys") case-insensitively. */
export function normalizeProductTypes(types: string[]): string[] {
  const byKey = new Map<string, string>();

  for (const type of types) {
    const trimmed = type.trim();
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, trimmed);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
}

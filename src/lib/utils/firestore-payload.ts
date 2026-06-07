import { FieldValue } from "firebase/firestore";

/** Firestore rejects `undefined` anywhere in a document (including nested arrays). */
export function toFirestoreData<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (value instanceof FieldValue || value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toFirestoreData(item)) as T;
  }

  const record = value as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(record)) {
    if (nested !== undefined) {
      cleaned[key] = toFirestoreData(nested);
    }
  }

  return cleaned as T;
}

import type { PhoneModel } from "@/types/phone-model";

/** Default iPhone models (11 → 17). Newest first in sortOrder. */
export const DEFAULT_PHONE_MODELS: Omit<PhoneModel, "id">[] = [
  { name: "iPhone 17 Pro Max", slug: "iphone-17-pro-max", sortOrder: 1, active: true },
  { name: "iPhone 17 Pro", slug: "iphone-17-pro", sortOrder: 2, active: true },
  { name: "iPhone 17", slug: "iphone-17", sortOrder: 3, active: true },
  { name: "iPhone 16 Pro Max", slug: "iphone-16-pro-max", sortOrder: 4, active: true },
  { name: "iPhone 16 Pro", slug: "iphone-16-pro", sortOrder: 5, active: true },
  { name: "iPhone 16", slug: "iphone-16", sortOrder: 6, active: true },
  { name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", sortOrder: 7, active: true },
  { name: "iPhone 15 Pro", slug: "iphone-15-pro", sortOrder: 8, active: true },
  { name: "iPhone 15", slug: "iphone-15", sortOrder: 9, active: true },
  { name: "iPhone 14 Pro Max", slug: "iphone-14-pro-max", sortOrder: 10, active: true },
  { name: "iPhone 14 Pro", slug: "iphone-14-pro", sortOrder: 11, active: true },
  { name: "iPhone 14", slug: "iphone-14", sortOrder: 12, active: true },
  { name: "iPhone 13 Pro Max", slug: "iphone-13-pro-max", sortOrder: 13, active: true },
  { name: "iPhone 13 Pro", slug: "iphone-13-pro", sortOrder: 14, active: true },
  { name: "iPhone 13", slug: "iphone-13", sortOrder: 15, active: true },
  { name: "iPhone 12 Pro Max", slug: "iphone-12-pro-max", sortOrder: 16, active: true },
  { name: "iPhone 12 Pro", slug: "iphone-12-pro", sortOrder: 17, active: true },
  { name: "iPhone 12", slug: "iphone-12", sortOrder: 18, active: true },
  { name: "iPhone 11 Pro Max", slug: "iphone-11-pro-max", sortOrder: 19, active: true },
  { name: "iPhone 11 Pro", slug: "iphone-11-pro", sortOrder: 20, active: true },
  { name: "iPhone 11", slug: "iphone-11", sortOrder: 21, active: true },
];

export function slugToModelId(slug: string): string {
  return slug;
}

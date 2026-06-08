/** Manual storefront tag set in admin. Omit or null = no tag shown. */
export const PRODUCT_TAGS = ["new", "hot"] as const;

export type ProductTag = (typeof PRODUCT_TAGS)[number];

export type ProductTagOption = ProductTag | "none";

export const PRODUCT_TAG_OPTIONS: Array<{ value: ProductTagOption; label: string }> = [
  { value: "none", label: "None" },
  { value: "new", label: "New" },
  { value: "hot", label: "Hot selling" },
];

export function getProductTagLabel(tag: ProductTag): string {
  if (tag === "new") {
    return "New";
  }
  return "Hot selling";
}

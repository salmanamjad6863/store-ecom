import type { Product, ProductWithVariants } from "@/types/product";

type ProductImageInput = {
  images: string[];
  colors: { images: string[] }[];
  variants?: { images: string[] }[];
};

function addUrl(set: Set<string>, url?: string | null) {
  if (url?.trim()) {
    set.add(url.trim());
  }
}

function addUrls(set: Set<string>, urls?: string[]) {
  urls?.forEach((url) => addUrl(set, url));
}

export function collectProductImageUrls(product: Product): Set<string> {
  const urls = new Set<string>();

  addUrls(urls, product.images);
  addUrl(urls, product.heroImage);
  product.colors.forEach((color) => {
    addUrls(urls, color.images);
    addUrl(urls, color.heroImage);
  });

  return urls;
}

export function collectProductWithVariantsImageUrls(product: ProductWithVariants): Set<string> {
  const urls = collectProductImageUrls(product);

  product.variants?.forEach((variant) => addUrls(urls, variant.images));

  return urls;
}

export function collectProductInputImageUrls(input: ProductImageInput): Set<string> {
  const urls = new Set<string>();

  addUrls(urls, input.images);
  input.colors.forEach((color) => addUrls(urls, color.images));
  input.variants?.forEach((variant) => addUrls(urls, variant.images));

  return urls;
}

export function diffOrphanedImageUrls(before: Set<string>, after: Set<string>): string[] {
  return [...before].filter((url) => !after.has(url));
}

import { getProductDisplayPrice } from "@/lib/utils/product";
import type { Product } from "@/types/product";

import type { ShopSort } from "@/components/shop/shop-toolbar";

export function filterAndSortProducts(
  products: Product[],
  search: string,
  sort: ShopSort,
): Product[] {
  const query = search.trim().toLowerCase();

  let filtered = products;

  if (query) {
    filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query),
    );
  }

  const sorted = [...filtered];

  switch (sort) {
    case "price-asc":
      sorted.sort(
        (a, b) => getProductDisplayPrice(a).amount - getProductDisplayPrice(b).amount,
      );
      break;
    case "price-desc":
      sorted.sort(
        (a, b) => getProductDisplayPrice(b).amount - getProductDisplayPrice(a).amount,
      );
      break;
    case "newest":
    default:
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
  }

  return sorted;
}

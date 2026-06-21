import type { FeaturedHeroItem } from "@/lib/featured/hero-items";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { resolveCatalogWithVariants } from "@/lib/queries/catalog-variants-server";
import {
  fetchHomepageSettingsOnServer,
  resolveFeaturedHeroProductsFromCatalog,
} from "@/lib/queries/store-settings-server";
import type { Product, ProductWithVariants } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

export type HomeCatalogData = {
  products: Product[];
  catalogWithVariants: ProductWithVariants[];
  featuredHeroItems: FeaturedHeroItem[];
  phoneModels: PhoneModel[];
};

/** Single-pass home catalog load for hydration + skeleton counts. */
export async function fetchHomeCatalogData(): Promise<HomeCatalogData> {
  const [products, settings, phoneModels] = await Promise.all([
    fetchProductsOnServer(),
    fetchHomepageSettingsOnServer(),
    fetchPhoneModelsOnServer(),
  ]);

  const catalogWithVariants = await resolveCatalogWithVariants(products);
  const featuredHeroItems = resolveFeaturedHeroProductsFromCatalog(products, settings);

  return { products, catalogWithVariants, featuredHeroItems, phoneModels };
}

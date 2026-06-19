import type { FeaturedHeroItem } from "@/lib/featured/hero-items";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import {
  fetchHomepageSettingsOnServer,
  resolveFeaturedHeroProductsFromCatalog,
} from "@/lib/queries/store-settings-server";
import type { Product } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

export type HomeCatalogData = {
  products: Product[];
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

  const featuredHeroItems = resolveFeaturedHeroProductsFromCatalog(products, settings);

  return { products, featuredHeroItems, phoneModels };
}

import type { Metadata } from "next";

import { ShopContent } from "@/components/shop/shop-content";
import { CatalogHydration } from "@/components/providers/catalog-hydration";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCatalogDehydratedState } from "@/lib/queries/hydrate-catalog";
import { resolveCatalogWithVariants } from "@/lib/queries/catalog-variants-server";
import { fetchPhoneModelsOnServer } from "@/lib/queries/phone-models-server";
import { fetchProductsOnServer } from "@/lib/queries/products-server";
import { buildForHerMetadata } from "@/lib/seo/collections";
import { buildBreadcrumbJsonLd } from "@/lib/seo/faq";

export const metadata: Metadata = buildForHerMetadata();

export default async function ForHerShopPage() {
  const [products, phoneModels] = await Promise.all([
    fetchProductsOnServer(),
    fetchPhoneModelsOnServer(),
  ]);

  const catalogWithVariants = await resolveCatalogWithVariants(products);

  const dehydratedState = buildCatalogDehydratedState({
    products,
    catalogWithVariants,
    phoneModels,
  });

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: "For Her", path: "/shop/for-her" },
        ])}
      />
      <CatalogHydration state={dehydratedState}>
        <ShopContent
          skeletonCount={products.length}
          srTitle="iPhone Covers for Women"
          heading={{
            eyebrow: "For Her",
            title: (
              <>
                Designed to be <em className="italic text-accent">irresistible</em>
              </>
            ),
            lead: "Premium iPhone covers made for her.",
          }}
        />
      </CatalogHydration>
    </>
  );
}

import type { Metadata } from "next";

import { env } from "@/lib/env";
import { getProductDisplayPrice, isProductSoldOut } from "@/lib/utils/product";
import { getColorHeroImage, resolveFeaturedColor } from "@/lib/utils/product-colors";
import type { ProductWithVariants } from "@/types/product";

import { buildBreadcrumbJsonLd } from "./faq";
import { buildProductImageAlt } from "./shop-seo";
import {
  STORE_SEO,
  buildDefaultOpenGraph,
  getSiteUrl,
  truncateSeoDescription,
} from "./site";

function getProductSeoImages(product: ProductWithVariants): string[] {
  const images = new Set<string>();

  if (product.heroImage) {
    images.add(product.heroImage);
  }

  for (const image of product.images) {
    if (image) {
      images.add(image);
    }
  }

  const featuredColor = resolveFeaturedColor(product);
  const heroImage = getColorHeroImage(featuredColor, product.variants ?? []);
  if (heroImage) {
    images.add(heroImage);
  }

  for (const color of product.colors) {
    if (color.heroImage) {
      images.add(color.heroImage);
    }
    for (const image of color.images) {
      if (image) {
        images.add(image);
      }
    }
  }

  return Array.from(images);
}

export function buildProductMetadata(product: ProductWithVariants): Metadata {
  const title = `${product.theme} iPhone Cover`;
  const description = truncateSeoDescription(
    product.description ||
      `Shop the ${product.theme} premium iPhone cover at ${STORE_SEO.name}. Cash on delivery available across Pakistan.`,
  );
  const canonicalPath = `/shop/${product.slug}`;
  const images = getProductSeoImages(product);
  const imageAlt = buildProductImageAlt(product.theme);

  return {
    title,
    description,
    alternates: {
      canonical: getSiteUrl(canonicalPath),
    },
    openGraph: {
      ...buildDefaultOpenGraph(title, description, canonicalPath),
      type: "website",
      images: images.length > 0 ? images.map((url) => ({ url, alt: imageAlt })) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images[0] ? [images[0]] : undefined,
    },
    robots: product.hidden ? { index: false, follow: false } : undefined,
  };
}

export function buildProductJsonLd(product: ProductWithVariants) {
  const { amount } = getProductDisplayPrice(product);
  const images = getProductSeoImages(product);
  const productUrl = getSiteUrl(`/shop/${product.slug}`);

  return [
    {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.theme} iPhone Cover`,
    description: product.description || `${product.theme} premium iPhone cover`,
    image: images,
    sku: product.slug,
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: STORE_SEO.name,
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: env.currency.code,
      price: amount / 100,
      availability: isProductSoldOut(product)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  },
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: product.theme, path: `/shop/${product.slug}` },
    ]),
  ];
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: STORE_SEO.name,
    url: getSiteUrl("/"),
    sameAs: [STORE_SEO.instagramUrl],
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: STORE_SEO.name,
    url: getSiteUrl("/"),
  };
}

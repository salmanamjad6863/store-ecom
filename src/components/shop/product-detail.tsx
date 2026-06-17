"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Text } from "@/components/ui/text";
import { usePhoneModels } from "@/hooks/use-phone-models";
import { useProductWithVariants } from "@/hooks/use-product-with-variants";
import {
  getColorById,
  getColorHeroImage,
  getVariantsForColor,
  resolveShopDisplayColor,
} from "@/lib/utils/product-colors";
import { getProductDisplayPrice } from "@/lib/utils/product";
import {
  formatVariantLabel,
  getUniqueModelIdsFromVariants,
  getVariantByModel,
  isVariantSoldOut,
  productHasVariants,
  resolveModelSelection,
  getVariantDisplayPrice,
} from "@/lib/utils/variant";
import type { ProductWithVariants } from "@/types/product";

import { AddToCartButton } from "./add-to-cart-button";
import { DesignColorSwitcher } from "./design-color-switcher";
import { ProductBadges } from "./product-badges";
import { ProductDetailSkeleton } from "./product-detail-skeleton";
import { ProductHeroGallery } from "./product-hero-gallery";
import { ModelSelector } from "./variant-selectors";

type ProductDetailProps = {
  slug: string;
  initialProduct: ProductWithVariants;
};

export function ProductDetail({ slug, initialProduct }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const { data, isPending, isError, error } = useProductWithVariants(slug, initialProduct);
  const product = data ?? initialProduct;
  const { data: phoneModels = [] } = usePhoneModels();

  const [activeColorId, setActiveColorId] = useState(
    () => product.colors[0]?.colorId ?? "",
  );
  const [selectedModelId, setSelectedModelId] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const colorTouchedRef = useRef(false);

  const activeColor = useMemo(
    () => getColorById(product, activeColorId) ?? product.colors[0],
    [product, activeColorId],
  );

  const variants = product.variants ?? [];
  const colorVariants = useMemo(
    () => getVariantsForColor(variants, activeColor.colorId),
    [variants, activeColor.colorId],
  );
  const hasVariants = productHasVariants(product) && colorVariants.length > 0;
  const hasColorOptions = product.colors.length > 1;

  const updateUrl = useCallback(
    (colorId: string, modelId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("color", colorId);
      if (modelId) {
        params.set("model", modelId);
      } else {
        params.delete("model");
      }
      const query = params.toString();
      const nextUrl = `/shop/${product.slug}${query ? `?${query}` : ""}`;
      window.history.replaceState(null, "", nextUrl);
    },
    [searchParams, product.slug],
  );

  const handleColorSelect = useCallback(
    (colorId: string) => {
      colorTouchedRef.current = true;
      const nextColor = getColorById(product, colorId);
      if (!nextColor) {
        return;
      }

      const nextVariants = getVariantsForColor(variants, colorId);

      let nextModelId = selectedModelId;
      if (!getVariantByModel(nextVariants, nextModelId, colorId)) {
        const fallback = resolveModelSelection(product, nextVariants, undefined, colorId);
        nextModelId = fallback?.modelId ?? "";
      }

      setActiveColorId(colorId);
      setSelectedModelId(nextModelId);
      setActiveImage(0);
      setQuantity(1);
      updateUrl(colorId, nextModelId);
    },
    [product, variants, selectedModelId, updateUrl],
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setSelectedModelId(modelId);
      updateUrl(activeColor.colorId, modelId);
    },
    [activeColor.colorId, updateUrl],
  );

  useEffect(() => {
    colorTouchedRef.current = false;
  }, [slug]);

  useEffect(() => {
    if (colorTouchedRef.current) {
      return;
    }

    const urlColor = searchParams.get("color") ?? undefined;
    const displayColor = resolveShopDisplayColor(product, urlColor);
    setActiveColorId(displayColor.colorId);
  }, [slug, product, searchParams]);

  useEffect(() => {
    if (getVariantByModel(colorVariants, selectedModelId, activeColor.colorId)) {
      return;
    }

    const urlModel = searchParams.get("model") ?? undefined;
    const selection = resolveModelSelection(
      product,
      colorVariants,
      urlModel,
      activeColor.colorId,
    );
    if (selection) {
      setSelectedModelId(selection.modelId);
    }
  }, [product, colorVariants, activeColor.colorId, selectedModelId, searchParams]);

  const selectedVariant = useMemo(
    () =>
      resolveModelSelection(product, colorVariants, selectedModelId, activeColor.colorId)
        ?.variant ?? null,
    [product, colorVariants, selectedModelId, activeColor.colorId],
  );

  const availableModelIds = useMemo(
    () => getUniqueModelIdsFromVariants(colorVariants),
    [colorVariants],
  );

  const availableModels = useMemo(
    () => phoneModels.filter((model) => availableModelIds.includes(model.id)),
    [phoneModels, availableModelIds],
  );

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [selectedVariant?.id, activeColor.colorId]);

  useEffect(() => {
    if (!selectedVariant) {
      return;
    }
    if (quantity > selectedVariant.quantity) {
      setQuantity(Math.max(1, selectedVariant.quantity));
    }
  }, [selectedVariant, quantity]);

  if (isPending && data === undefined) {
    return <ProductDetailSkeleton product={initialProduct} />;
  }

  if (isError) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Could not load product"
          description={error instanceof Error ? error.message : "Please try again later."}
          action={<Button href="/shop" variant="secondary">Back to shop</Button>}
        />
      </Container>
    );
  }

  if (!product || !activeColor) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Product not found"
          action={<Button href="/shop" variant="secondary">Back to shop</Button>}
        />
      </Container>
    );
  }

  const displayPrice = selectedVariant
    ? getVariantDisplayPrice(product, selectedVariant)
    : getProductDisplayPrice(product);

  const soldOut = selectedVariant
    ? isVariantSoldOut(selectedVariant)
    : (activeColor.totalQuantity ?? 0) <= 0;

  const images = selectedVariant?.images.length
    ? selectedVariant.images
    : activeColor.images.length > 0
      ? activeColor.images
      : [getColorHeroImage(activeColor, variants)];

  const maxQuantity = selectedVariant?.quantity ?? activeColor.totalQuantity ?? 0;

  return (
    <Container className="py-8 sm:py-12">
      <Link
        href="/shop"
        className="mb-4 inline-block text-sm font-medium text-muted hover:text-foreground sm:mb-6"
      >
        ← Back to shop
      </Link>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        <ProductHeroGallery
          images={images.filter(Boolean)}
          alt={`${product.theme} — ${activeColor.colorName}`}
          transitionKey={`${product.id}-${activeColor.colorId}-${selectedVariant?.id ?? "base"}`}
          activeIndex={activeImage}
          onActiveIndexChange={setActiveImage}
        />

        <div className="flex flex-col gap-6">
          <ProductBadges product={product} className="!items-start" />
          <Text variant="small" as="p" className="text-[11px] uppercase tracking-[0.15em] text-warm">
            {product.theme}
            {hasColorOptions ? (
              <>
                {" · "}
                <span className="text-accent">{activeColor.colorName}</span>
              </>
            ) : activeColor.colorName ? (
              <> · {activeColor.colorName}</>
            ) : null}
          </Text>
          <Text variant="h1" as="h1" className="font-serif text-3xl font-bold text-deep sm:text-4xl">
            {product.theme}
          </Text>
          {activeColor.themeLine ? (
            <Text variant="body" as="p" className="-mt-2 italic text-warm">
              {activeColor.themeLine}
            </Text>
          ) : null}
          <Price amount={displayPrice.amount} compareAt={displayPrice.compareAt} className="text-xl" compareFirst />
          <Text variant="muted" as="p" className={soldOut ? "font-medium text-danger" : undefined}>
            {soldOut ? "This option is sold out." : `${maxQuantity} in stock`}
          </Text>

          {hasVariants ? (
            <div className="space-y-5 border-y border-muted/20 py-5">
              <ModelSelector
                models={availableModels}
                selectedModelId={selectedModelId}
                onSelect={handleModelSelect}
              />
              {selectedVariant ? (
                <Text variant="small" as="p" className="text-muted">
                  Selected: {formatVariantLabel(activeColor.colorName, selectedVariant)}
                </Text>
              ) : null}
            </div>
          ) : null}

          <Text variant="body" as="p" className="leading-relaxed">
            {product.description}
          </Text>

          <div className="flex flex-col gap-4 border-t border-muted/20 pt-6 sm:flex-row sm:items-end">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              max={maxQuantity}
              disabled={soldOut}
              className="sm:flex-1"
            />
            <AddToCartButton
              product={product}
              catalog={product}
              variant={selectedVariant ?? undefined}
              colorId={activeColor.colorId}
              colorName={activeColor.colorName}
              quantity={quantity}
              size="lg"
              className="w-full sm:w-auto sm:min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {hasColorOptions ? (
        <DesignColorSwitcher
          theme={product.theme}
          colors={product.colors}
          variants={variants}
          activeColorId={activeColor.colorId}
          onSelect={handleColorSelect}
          className="mt-10 sm:mt-14"
        />
      ) : null}
    </Container>
  );
}

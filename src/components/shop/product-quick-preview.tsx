"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/ui/price";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { usePhoneModels } from "@/hooks/use-phone-models";
import { queryKeys } from "@/lib/queries/keys";
import { fetchProductWithVariantsBySlug } from "@/lib/queries/products";
import { cn } from "@/lib/utils/cn";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/utils/scroll-lock";
import {
  getColorById,
  getColorHeroImage,
  getVariantsForColor,
  isColorSoldOut,
  resolveShopDisplayColor,
} from "@/lib/utils/product-colors";
import { getProductDisplayPrice } from "@/lib/utils/product";
import {
  getUniqueModelIdsFromVariants,
  getVariantByModel,
  isVariantSoldOut,
  productHasVariants,
  resolveModelSelection,
} from "@/lib/utils/variant";
import { addVariantToCart } from "@/stores/cart-store";
import { useToast } from "@/providers/toast-provider";
import type { Product } from "@/types/product";
import type { PhoneModel } from "@/types/phone-model";

type ProductQuickPreviewProps = {
  open: boolean;
  product: Product;
  initialColorId?: string;
  initialVariantId?: string;
  onClose: () => void;
};

const ANIMATION_MS = 320;

function ModelDropdown({
  models,
  selectedModelId,
  onSelect,
  disabled,
}: {
  models: PhoneModel[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
}) {
  if (models.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <Label htmlFor="preview-model" className="text-[11px] font-medium uppercase tracking-[0.15em] text-warm">
        Choose your model
      </Label>
      <select
        id="preview-model"
        value={selectedModelId}
        disabled={disabled}
        onChange={(event) => onSelect(event.target.value)}
        className={cn(
          "h-12 w-full appearance-none rounded-xl border border-deep/10 bg-white px-4 pr-10 text-sm font-medium text-deep shadow-sm",
          "bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat",
          "transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%232b1a14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        <option value="" disabled>
          Choose your model
        </option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ProductQuickPreview({
  open,
  product,
  initialColorId,
  initialVariantId,
  onClose,
}: ProductQuickPreviewProps) {
  const { toast } = useToast();
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: fullProduct, isPending } = useQuery({
    queryKey: queryKeys.products.detailWithVariants(product.slug),
    queryFn: () => fetchProductWithVariantsBySlug(product.slug),
    enabled: open,
  });

  const { data: phoneModels = [] } = usePhoneModels();

  const catalogProduct = fullProduct ?? product;
  const variants = fullProduct?.variants ?? [];
  const hasVariants = productHasVariants(catalogProduct) && variants.length > 0;

  const activeColor = useMemo(
    () => getColorById(catalogProduct, selectedColorId) ?? catalogProduct.colors[0],
    [catalogProduct, selectedColorId],
  );

  const colorVariants = useMemo(
    () => getVariantsForColor(variants, activeColor?.colorId ?? ""),
    [variants, activeColor?.colorId],
  );

  const availableModelIds = useMemo(
    () => getUniqueModelIdsFromVariants(colorVariants),
    [colorVariants],
  );

  const availableModels = useMemo(
    () => phoneModels.filter((model) => availableModelIds.includes(model.id)),
    [phoneModels, availableModelIds],
  );

  const selectedVariant = useMemo(
    () =>
      resolveModelSelection(
        catalogProduct,
        colorVariants,
        selectedModelId,
        activeColor?.colorId,
      )?.variant ?? null,
    [catalogProduct, colorVariants, selectedModelId, activeColor?.colorId],
  );

  const displayPrice = getProductDisplayPrice(catalogProduct);

  const optionSoldOut = selectedVariant
    ? isVariantSoldOut(selectedVariant)
    : activeColor
      ? isColorSoldOut(activeColor, variants)
      : false;

  const maxQuantity = optionSoldOut
    ? 0
    : selectedVariant
      ? Math.max(selectedVariant.quantity, 1)
      : hasVariants
        ? 1
        : Math.max(activeColor?.totalQuantity ?? catalogProduct.quantity ?? 1, 1);

  const previewImage = useMemo(() => {
    if (selectedVariant?.images.length) {
      return selectedVariant.images[0];
    }
    if (activeColor) {
      return getColorHeroImage(activeColor, variants);
    }
    return catalogProduct.heroImage ?? catalogProduct.images[0] ?? "";
  }, [selectedVariant, activeColor, variants, catalogProduct]);

  useEffect(() => {
    if (open) {
      setPresent(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setPresent(false), ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    lockBodyScroll();
    window.addEventListener("keydown", onKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !fullProduct) {
      return;
    }

    const cartVariant = initialVariantId
      ? fullProduct.variants.find((variant) => variant.id === initialVariantId)
      : undefined;
    const color = cartVariant
      ? (getColorById(fullProduct, cartVariant.colorId) ??
        resolveShopDisplayColor(fullProduct, initialColorId))
      : resolveShopDisplayColor(fullProduct, initialColorId);
    const nextColorVariants = getVariantsForColor(fullProduct.variants, color.colorId);
    const selection = resolveModelSelection(
      fullProduct,
      nextColorVariants,
      cartVariant?.modelId,
      color.colorId,
    );

    setSelectedColorId(color.colorId);
    setSelectedModelId(cartVariant?.modelId ?? selection?.modelId ?? "");
    setQuantity(1);
  }, [open, fullProduct, initialColorId, initialVariantId]);

  useEffect(() => {
    setQuantity((current) => Math.min(Math.max(current, 1), maxQuantity));
  }, [maxQuantity, selectedVariant?.id, activeColor?.colorId]);

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    setQuantity(1);
    const nextVariants = getVariantsForColor(variants, colorId);
    const current = getVariantByModel(nextVariants, selectedModelId, colorId);
    if (current) {
      return;
    }
    const fallback = resolveModelSelection(catalogProduct, nextVariants, undefined, colorId);
    setSelectedModelId(fallback?.modelId ?? "");
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (optionSoldOut) {
      return;
    }

    if (hasVariants && !selectedVariant) {
      toast("Choose your iPhone model to continue", "error");
      return;
    }

    addVariantToCart(
      catalogProduct,
      selectedVariant ?? undefined,
      quantity,
      activeColor?.colorId,
    );

    const label = selectedVariant
      ? `${catalogProduct.theme} (${selectedVariant.modelName} · ${activeColor?.colorName})`
      : catalogProduct.theme;

    toast(
      quantity > 1 ? `${quantity} × ${label} added to cart` : `${label} added to cart`,
      "success",
    );
    onClose();
  };

  if (!present) {
    return null;
  }

  const isMultiColor = catalogProduct.colors.length > 1;
  const canAddToCart = !optionSoldOut && (!hasVariants || Boolean(selectedVariant));

  const modal = (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6 lg:p-10",
        "transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-deep/60 backdrop-blur-md"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${catalogProduct.theme}`}
        className={cn(
          "relative z-10 flex w-full max-w-lg flex-col overflow-hidden bg-cream sm:max-w-md",
          "max-h-[min(96vh,880px)]",
          "rounded-t-[1.75rem] shadow-[0_40px_100px_rgba(43,26,20,0.28)] sm:rounded-[1.75rem]",
          "transition-all duration-300 ease-out",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-12 scale-[0.98] opacity-0 sm:translate-y-8",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-deep/10 bg-white/95 text-deep shadow-lg backdrop-blur-sm transition hover:scale-105"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative bg-gradient-to-b from-[#f3ebe4] via-soft to-cream px-6 pb-2 pt-12 sm:px-8 sm:pt-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,123,107,0.1)_0%,transparent_60%)]" />
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] sm:max-w-[300px]">
              <div className="absolute -inset-3 rounded-[1.5rem] bg-white/40 blur-xl" aria-hidden />
              <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/70 p-5 shadow-[0_24px_60px_rgba(43,26,20,0.12)] sm:p-6">
                {isPending && !previewImage ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : previewImage ? (
                  <Image
                    key={`${activeColor?.colorId}-${selectedVariant?.id ?? "base"}-${previewImage}`}
                    src={previewImage}
                    alt={catalogProduct.theme}
                    fill
                    sizes="(max-width: 640px) 300px, 320px"
                    className="object-contain transition-opacity duration-300"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-8 sm:py-6">
            <div className="space-y-1">
              <Text variant="small" as="p" className="text-[10px] uppercase tracking-[0.2em] text-warm">
                {catalogProduct.type}
              </Text>
              <Text variant="h2" as="h2" className="font-serif text-2xl leading-tight text-deep sm:text-[1.75rem]">
                {catalogProduct.theme}
              </Text>
              {activeColor?.themeLine ? (
                <Text variant="body" as="p" className="pt-1 text-sm italic leading-relaxed text-warm">
                  {activeColor.themeLine}
                </Text>
              ) : null}
            </div>

            <div className="border-y border-deep/8 py-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-warm">Price</p>
              <div className="mt-2">
                <Price
                  amount={displayPrice.amount}
                  compareAt={displayPrice.compareAt}
                  compareFirst
                  className="font-serif text-2xl sm:text-[1.65rem]"
                />
              </div>
              {optionSoldOut ? (
                <p className="mt-2 text-sm font-medium text-danger">This option is sold out</p>
              ) : null}
            </div>

            {isPending ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-6">
                {isMultiColor ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-warm">
                      Choose your color
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {catalogProduct.colors.map((color) => {
                        const isActive = color.colorId === selectedColorId;
                        const soldOut = isColorSoldOut(color, variants);

                        return (
                          <button
                            key={color.id}
                            type="button"
                            disabled={soldOut && !isActive}
                            onClick={() => handleColorSelect(color.colorId)}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-3.5 py-2 text-left transition-all",
                              isActive
                                ? "border-deep bg-deep text-cream shadow-md"
                                : "border-deep/10 bg-white text-deep hover:border-accent/40",
                              soldOut && !isActive && "opacity-45",
                            )}
                          >
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-deep/10"
                              style={{ backgroundColor: color.colorHex ?? "#d4d4d4" }}
                            />
                            <span className="text-xs font-medium sm:text-sm">{color.colorName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {hasVariants ? (
                  <ModelDropdown
                    models={availableModels}
                    selectedModelId={selectedModelId}
                    onSelect={handleModelSelect}
                    disabled={isPending}
                  />
                ) : null}

                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={maxQuantity}
                  disabled={optionSoldOut || (hasVariants && !selectedVariant)}
                  showMaxHint={false}
                  label="Quantity"
                  className="[&_label]:text-[11px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-[0.15em] [&_label]:text-warm"
                />
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-deep/8 bg-cream px-5 py-4 sm:px-8 sm:py-5">
          <Button
            type="button"
            className="w-full"
            disabled={!canAddToCart}
            onClick={handleAddToCart}
          >
            {optionSoldOut ? "Sold out" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : null;
}

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
import { fetchProductWithVariantsById } from "@/lib/queries/products";
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
  onExited?: () => void;
};

const PANEL_ANIMATION_MS = 550;
const OPEN_DELAY_MS = 100;

/** Rolling water surface — tiles seamlessly; body fills below the crest line. */
const WAVE_PATH_BACK =
  "M0 88 C45 82 90 94 135 88 S225 82 270 88 S360 94 405 88 S495 82 540 88 S630 94 675 88 S765 82 810 88 S900 94 945 88 S1035 82 1080 88 S1170 94 1215 88 S1305 82 1350 88 S1395 94 1440 88 V200 H0 Z";

const WAVE_PATH_MID =
  "M0 82 C45 88 90 76 135 82 S225 88 270 82 S360 76 405 82 S495 88 540 82 S630 76 675 82 S765 88 810 82 S900 76 945 82 S1035 88 1080 82 S1170 76 1215 82 S1305 88 1350 82 S1395 76 1440 82 V200 H0 Z";

const WAVE_PATH_FRONT =
  "M0 78 C45 72 90 84 135 78 S225 72 270 78 S360 84 405 78 S495 72 540 78 S630 84 675 78 S765 72 810 78 S900 84 945 78 S1035 72 1080 78 S1170 84 1215 78 S1305 72 1350 78 S1395 84 1440 78 V200 H0 Z";

function PreviewWaterLayer({
  path,
  fill,
  bodyClass,
  swellClass,
  driftClass,
}: {
  path: string;
  fill: string;
  bodyClass: string;
  swellClass: string;
  driftClass: string;
}) {
  const tile = (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill={fill} />
    </svg>
  );

  return (
    <div className={cn("preview-wave-media__body", bodyClass)}>
      <div className={cn("preview-wave-media__swell", swellClass)}>
        <div className={cn("preview-wave-media__drift", driftClass)}>
          {tile}
          {tile}
        </div>
      </div>
    </div>
  );
}

function PreviewWaveBackdrop() {
  return (
    <div className="preview-wave-media absolute inset-0 overflow-hidden" aria-hidden>
      <div className="preview-wave-media__pool absolute inset-0" />
      <div className="preview-wave-media__glow absolute inset-0" />
      <PreviewWaterLayer
        path={WAVE_PATH_BACK}
        fill="rgba(232, 196, 184, 0.5)"
        bodyClass="preview-wave-media__body--back"
        swellClass="preview-wave-media__swell--back"
        driftClass="preview-wave-media__drift--back"
      />
      <PreviewWaterLayer
        path={WAVE_PATH_MID}
        fill="rgba(232, 196, 184, 0.38)"
        bodyClass="preview-wave-media__body--mid"
        swellClass="preview-wave-media__swell--mid"
        driftClass="preview-wave-media__drift--mid"
      />
      <PreviewWaterLayer
        path={WAVE_PATH_FRONT}
        fill="rgba(201, 123, 107, 0.26)"
        bodyClass="preview-wave-media__body--front"
        swellClass="preview-wave-media__swell--front"
        driftClass="preview-wave-media__drift--front"
      />
      <div className="preview-wave-media__shimmer absolute inset-0" />
    </div>
  );
}

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
  onExited,
}: ProductQuickPreviewProps) {
  const { toast } = useToast();
  const [present, setPresent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { data: fullProduct, isPending } = useQuery({
    queryKey: queryKeys.products.detailWithVariantsById(product.id),
    queryFn: () => fetchProductWithVariantsById(product.id),
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
      setVisible(false);

      const openTimer = window.setTimeout(() => setVisible(true), OPEN_DELAY_MS);
      return () => window.clearTimeout(openTimer);
    }

    setVisible(false);
    const closeTimer = window.setTimeout(() => {
      setPresent(false);
      onExited?.();
    }, PANEL_ANIMATION_MS + 40);

    return () => window.clearTimeout(closeTimer);
  }, [open, onExited]);

  useEffect(() => {
    if (!present) {
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
  }, [present, onClose]);

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
      className="fixed inset-0 z-[100] md:flex md:items-center md:justify-center md:p-8 lg:p-10"
      role="presentation"
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-deep/50 backdrop-blur-[2px]",
          "transition-opacity ease-out max-md:duration-[480ms] md:duration-[480ms]",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${catalogProduct.theme}`}
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 flex w-full flex-col overflow-hidden bg-cream shadow-2xl will-change-transform",
          "max-h-[min(92dvh,880px)] rounded-t-[1.75rem]",
          "transition-transform max-md:duration-[550ms] max-md:ease-[cubic-bezier(0.16,1,0.3,1)]",
          "md:relative md:inset-auto md:bottom-auto md:max-h-[min(90vh,920px)] md:rounded-[1.75rem]",
          "md:w-full md:max-w-xl lg:max-w-2xl",
          "md:transition-[transform,opacity] md:duration-[550ms] md:ease-[cubic-bezier(0.16,1,0.3,1)]",
          visible
            ? "translate-y-0 md:scale-100 md:opacity-100"
            : "translate-y-full md:translate-y-0 md:scale-[0.97] md:opacity-0",
        )}
      >
        <div
          className="absolute left-1/2 top-2.5 z-30 h-1 w-10 -translate-x-1/2 rounded-full bg-deep/15 md:hidden"
          aria-hidden
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-deep/10 bg-white text-deep shadow-sm transition hover:bg-soft md:top-4"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="relative bg-gradient-to-b from-[#f3ebe4] via-soft to-cream px-6 pb-2 pt-12 sm:px-8 sm:pt-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,123,107,0.1)_0%,transparent_60%)]" />
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px]">
              <div
                className="absolute -inset-3 rounded-[1.5rem] bg-accent/15 blur-2xl"
                aria-hidden
              />
              <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] border border-deep/[0.06] shadow-[0_24px_60px_rgba(43,26,20,0.14)]">
                <PreviewWaveBackdrop />
                <div className="relative z-10 h-full w-full p-5 sm:p-6">
                  {isPending && !previewImage ? (
                    <div className="flex h-full items-center justify-center">
                      <Spinner size="lg" />
                    </div>
                  ) : previewImage ? (
                    <div className="relative h-full w-full">
                      <Image
                        key={`${activeColor?.colorId}-${selectedVariant?.id ?? "base"}-${previewImage}`}
                        src={previewImage}
                        alt={catalogProduct.theme}
                        fill
                        sizes="(max-width: 640px) 300px, 320px"
                        className="object-contain transition-opacity duration-300 drop-shadow-[0_12px_28px_rgba(43,26,20,0.12)]"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted">
                      No image
                    </div>
                  )}
                </div>
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

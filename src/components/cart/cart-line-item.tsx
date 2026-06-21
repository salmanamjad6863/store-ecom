"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";
import { getCartLineKey, type CartItem } from "@/types/cart";

import { CartThumbnailImage } from "./cart-thumbnail-image";

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (lineKey: string, quantity: number) => void;
  onRemove: (lineKey: string) => void;
  onOpenPreview: (item: CartItem) => void;
};

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
  onOpenPreview,
}: CartLineItemProps) {
  const lineKey = getCartLineKey(item.productId, item.colorId, item.variantId);
  const lineTotal = item.unitPrice * item.quantity;
  const atMax = item.quantity >= item.maxQuantity;

  return (
    <li className="flex gap-4 border-b border-deep/6 py-5 pl-5 pr-4 last:border-b-0 sm:gap-5 sm:pl-6 sm:pr-5">
      <button
        type="button"
        onClick={() => onOpenPreview(item)}
        className="relative mt-0.5 h-[112px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-deep/8 bg-white p-2 transition hover:border-deep/15 hover:shadow-sm sm:h-[120px] sm:w-[84px]"
        aria-label={`Edit ${item.name}`}
      >
        {item.image ? (
          <CartThumbnailImage src={item.image} alt={item.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted">
            No image
          </div>
        )}
      </button>

      <div className="flex min-h-[112px] min-w-0 flex-1 flex-col sm:min-h-[120px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onOpenPreview(item)}
              className="text-left hover:text-accent"
            >
              <Text
                variant="h2"
                as="h3"
                className="line-clamp-2 text-[15px] font-medium leading-snug text-deep sm:text-base"
              >
                {item.name}
              </Text>
            </button>
            {item.modelName && item.colorName ? (
              <Text variant="small" as="p" className="mt-1 text-muted">
                {item.modelName} · {item.colorName}
              </Text>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onRemove(lineKey)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-deep/5 hover:text-danger"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-3">
          <Text variant="small" as="p" className="text-muted">
            <Price amount={item.unitPrice} className="font-normal text-muted" />
            <span className="ml-1">each</span>
          </Text>
          <Price amount={lineTotal} className="text-base font-semibold sm:text-lg" />
        </div>

        <div className="mt-auto space-y-2 pt-4">
          {atMax ? (
            <Text variant="small" as="p" className="text-danger">
              Maximum stock reached ({item.maxQuantity})
            </Text>
          ) : null}

          <div className="inline-flex items-center rounded-lg border border-deep/12 bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onUpdateQuantity(lineKey, item.quantity - 1)}
              className="flex h-9 w-9 items-center justify-center text-deep transition hover:bg-soft disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-9 border-x border-deep/10 px-1 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={atMax}
              onClick={() => onUpdateQuantity(lineKey, item.quantity + 1)}
              className={cn(
                "flex h-9 w-9 items-center justify-center text-deep transition hover:bg-soft",
                atMax && "cursor-not-allowed opacity-40",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

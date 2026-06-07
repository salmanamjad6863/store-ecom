"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { getCartLineKey, type CartItem } from "@/types/cart";

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (lineKey: string, quantity: number) => void;
  onRemove: (lineKey: string) => void;
};

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const lineKey = getCartLineKey(item.productId, item.colorId, item.variantId);
  const lineTotal = item.unitPrice * item.quantity;
  const atMax = item.quantity >= item.maxQuantity;

  return (
    <li className="flex gap-3 border-b border-muted/20 py-4 last:border-b-0 sm:gap-4 sm:py-6">
      <Link
        href={`/shop/${item.slug}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-muted/20 bg-background sm:h-24 sm:w-24 sm:rounded-lg"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 64px, 96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted sm:text-xs">
            No image
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
          <Link href={`/shop/${item.slug}`} className="hover:text-accent">
            <Text variant="h2" as="h3" className="line-clamp-2 text-sm leading-snug sm:text-lg">
              {item.name}
            </Text>
          </Link>
          {item.modelName && item.colorName ? (
            <Text variant="small" as="p" className="text-muted">
              {item.modelName} · {item.colorName}
            </Text>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs sm:gap-x-4 sm:text-sm">
            <span className="text-muted">
              Unit: <Price amount={item.unitPrice} />
            </span>
            <span className="text-muted">
              Line: <Price amount={lineTotal} />
            </span>
          </div>
          {atMax ? (
            <Text variant="small" as="p" className="text-danger">
              Maximum stock reached ({item.maxQuantity})
            </Text>
          ) : null}
        </div>

        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Decrease quantity"
              onClick={() => onUpdateQuantity(lineKey, item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Increase quantity"
              disabled={atMax}
              onClick={() => onUpdateQuantity(lineKey, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted hover:text-danger sm:h-9"
            onClick={() => onRemove(lineKey)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Remove</span>
          </Button>
        </div>
      </div>
    </li>
  );
}

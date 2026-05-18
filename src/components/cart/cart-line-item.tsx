"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import type { CartItem } from "@/types/cart";

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartLineItem({ item, onUpdateQuantity, onRemove }: CartLineItemProps) {
  const lineTotal = item.unitPrice * item.quantity;
  const atMax = item.quantity >= item.maxQuantity;

  return (
    <li className="flex gap-4 border-b border-muted/20 py-6 last:border-b-0">
      <Link
        href={`/shop/${item.slug}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-muted/20 bg-background"
      >
        {item.image ? (
          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">No image</div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Link href={`/shop/${item.slug}`} className="hover:text-accent">
            <Text variant="h2" as="h3" className="text-lg">
              {item.name}
            </Text>
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
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

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              aria-label="Decrease quantity"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
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
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted hover:text-danger"
            onClick={() => onRemove(item.productId)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
}

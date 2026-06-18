import Image from "next/image";

import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { resolveOrderItemDisplay } from "@/lib/orders/format-order-item-display";
import type { OrderItem } from "@/types/order";
import type { Product } from "@/types/product";

type OrderItemRowProps = {
  item: OrderItem;
  product?: Product | null;
};

export function OrderItemRow({ item, product }: OrderItemRowProps) {
  const display = resolveOrderItemDisplay(item, product);

  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      {item.image ? (
        <div className="relative h-[112px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-muted/20 bg-white p-2 sm:h-[120px] sm:w-[84px]">
          <Image
            src={item.image}
            alt={display.title}
            fill
            sizes="84px"
            className="object-contain p-1"
            unoptimized
          />
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 justify-between gap-4">
        <div className="min-w-0">
          <Text variant="body" as="p" className="font-medium">
            {display.title}
          </Text>
          {display.variantLine ? (
            <Text variant="small" as="p" className="text-muted">
              {display.variantLine}
            </Text>
          ) : null}
          <Text variant="small" as="p">
            Qty {item.quantity}
          </Text>
        </div>
        <Price amount={item.unitPrice * item.quantity} className="shrink-0" />
      </div>
    </li>
  );
}

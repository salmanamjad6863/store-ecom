import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils/cn";
import { getProductDisplayPrice } from "@/lib/utils/product";
import type { Product } from "@/types/product";

import { ProductBadges } from "./product-badges";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { amount, compareAt } = getProductDisplayPrice(product);
  const image = product.images[0];

  return (
    <Link href={`/shop/${product.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col gap-2 p-2.5 transition-shadow hover:shadow-md sm:gap-4 sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-md bg-background sm:rounded-lg">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
          <ProductBadges
            product={product}
            className="absolute left-1 top-1 sm:left-2 sm:top-2"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-2">
          <Text
            variant="small"
            as="p"
            className="truncate text-[10px] uppercase tracking-wide sm:text-xs"
          >
            {product.type}
          </Text>
          <Text
            variant="h2"
            as="h3"
            className="line-clamp-2 text-sm leading-snug sm:text-lg"
          >
            {product.name}
          </Text>
          <Price
            amount={amount}
            compareAt={compareAt}
            className={cn(
              "text-xs sm:text-base",
              compareAt !== undefined && compareAt > amount
                ? "flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2"
                : undefined,
            )}
          />
        </div>
      </Card>
    </Link>
  );
}

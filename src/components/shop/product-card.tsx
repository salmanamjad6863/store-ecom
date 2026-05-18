import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";
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
      <Card className="flex h-full flex-col gap-4 p-4 transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              No image
            </div>
          )}
          <ProductBadges product={product} className="absolute left-2 top-2" />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Text variant="small" as="p" className="uppercase tracking-wide">
            {product.type}
          </Text>
          <Text variant="h2" as="h3" className="text-lg">
            {product.name}
          </Text>
          <Price amount={amount} compareAt={compareAt} />
        </div>
      </Card>
    </Link>
  );
}

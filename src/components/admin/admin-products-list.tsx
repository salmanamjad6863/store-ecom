"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { env } from "@/lib/env";
import { formatCurrency } from "@/lib/utils/format";
import { getProductStatusBadges } from "@/lib/utils/product";

import { DeleteProductButton } from "./delete-product-button";

export function AdminProductsList() {
  const { data: products, isLoading, isError } = useAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Text variant="h1" as="h1">
            Products
          </Text>
          <Text variant="muted" as="p" className="mt-2">
            Manage catalog, stock, sales, and visibility.
          </Text>
        </div>
        <Button href="/admin/products/new">Add product</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          title="Could not load products"
          description="Check your Firebase connection and try again."
        />
      ) : null}

      {!isLoading && !isError && products && products.length > 0 ? (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-muted/20 bg-background">
              <tr>
                <th className="w-16 px-4 py-3 font-medium text-muted">
                  <span className="sr-only">Image</span>
                </th>
                <th className="px-4 py-3 font-medium text-muted">Name</th>
                <th className="px-4 py-3 font-medium text-muted">Type</th>
                <th className="px-4 py-3 font-medium text-muted">Qty</th>
                <th className="px-4 py-3 font-medium text-muted">Price</th>
                <th className="px-4 py-3 font-medium text-muted">Status</th>
                <th className="px-4 py-3 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const image = product.images[0];

                return (
                <tr key={product.id} className="border-b border-muted/10 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-muted/20 bg-background">
                      {image ? (
                        <Image
                          src={image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted">
                          —
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.type}</td>
                  <td className="px-4 py-3 text-muted">{product.quantity}</td>
                  <td className="px-4 py-3 text-muted">
                    {formatCurrency(product.price, env.currency.code, env.currency.locale)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {getProductStatusBadges(product).map((status) => (
                        <Badge key={status.label} variant={status.variant}>
                          {status.label}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton product={product} />
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}

      {!isLoading && !isError && products?.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to show it in the shop."
          action={<Button href="/admin/products/new">Add product</Button>}
        />
      ) : null}
    </div>
  );
}

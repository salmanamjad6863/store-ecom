"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useAdminProduct, useProductMutations } from "@/hooks/use-admin-products";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = typeof params.id === "string" ? params.id : "";

  const { data: product, isLoading, isError } = useAdminProduct(productId);
  const { updateMutation } = useProductMutations();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed."
        action={<Button href="/admin/products">Back to products</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-medium text-accent hover:underline">
          ← Back to products
        </Link>
        <Text variant="h1" as="h1" className="mt-2">
          Edit product
        </Text>
      </div>

      <ProductForm
        product={product}
        submitLabel="Update product"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (input) => {
          await updateMutation.mutateAsync({ id: productId, input });
          router.push("/admin/products");
        }}
      />
    </div>
  );
}

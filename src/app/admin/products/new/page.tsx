"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { Text } from "@/components/ui/text";
import { useProductMutations } from "@/hooks/use-admin-products";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { createMutation } = useProductMutations();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-medium text-accent hover:underline">
          ← Back to products
        </Link>
        <Text variant="h1" as="h1" className="mt-2">
          Add product
        </Text>
      </div>

      <ProductForm
        submitLabel="Create product"
        isSubmitting={createMutation.isPending}
        onSubmit={async (input) => {
          await createMutation.mutateAsync(input);
          router.push("/admin/products");
        }}
      />
    </div>
  );
}

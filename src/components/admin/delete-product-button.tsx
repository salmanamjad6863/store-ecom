"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useProductMutations } from "@/hooks/use-admin-products";
import { isDummyProductId } from "@/lib/data/dummy-products";
import type { Product } from "@/types/product";

type DeleteProductButtonProps = {
  product: Product;
};

export function DeleteProductButton({ product }: DeleteProductButtonProps) {
  const { deleteMutation } = useProductMutations();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDummy = isDummyProductId(product.id);

  const handleConfirm = async () => {
    setError(null);

    try {
      await deleteMutation.mutateAsync(product.id);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this product.");
    }
  };

  if (isDummy) {
    return (
      <span className="text-xs text-muted" title="Sample product cannot be deleted">
        —
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="font-medium text-danger hover:underline"
      >
        Delete
      </button>

      <ConfirmDialog
        open={open}
        title="Delete product permanently?"
        description={`"${product.name}" will be removed from Firestore and the shop. This cannot be undone.`}
        confirmLabel="Delete permanently"
        destructive
        errorMessage={error}
        isLoading={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setOpen(false);
            setError(null);
          }
        }}
        onConfirm={() => {
          void handleConfirm();
        }}
      />
    </>
  );
}

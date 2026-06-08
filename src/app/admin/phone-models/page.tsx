"use client";

import Link from "next/link";

import { PhoneModelsManager } from "@/components/admin/phone-models-manager";
import { Text } from "@/components/ui/text";

export default function AdminPhoneModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="text-sm font-medium text-accent hover:underline">
          ← Back to products
        </Link>
        <Text variant="h1" as="h1" className="mt-2">
          iPhone models
        </Text>
        <Text variant="muted" as="p" className="mt-1">
          Manage which iPhone models appear in variant matrices and shop category filters.
        </Text>
      </div>

      <PhoneModelsManager />
    </div>
  );
}

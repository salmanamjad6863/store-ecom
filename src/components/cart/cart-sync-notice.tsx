"use client";

import { Text } from "@/components/ui/text";
import type { CartSyncResult } from "@/lib/cart/sync-cart";

type CartSyncNoticeProps = {
  result: CartSyncResult | null;
};

export function CartSyncNotice({ result }: CartSyncNoticeProps) {
  if (!result || result.issues.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
      <Text variant="small" as="p" className="font-medium text-foreground">
        Your cart was updated
      </Text>
      <ul className="mt-2 list-inside list-disc space-y-1">
        {result.issues.map((issue) => (
          <li key={`${issue.lineKey}-${issue.type}`} className="text-sm text-muted">
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

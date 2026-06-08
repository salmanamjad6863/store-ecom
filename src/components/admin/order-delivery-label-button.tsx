"use client";

import { Download } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { downloadOrderDeliveryLabelPdf } from "@/lib/pdf/order-delivery-label";
import { cn } from "@/lib/utils/cn";
import type { Order } from "@/types/order";

type OrderDeliveryLabelButtonProps = {
  order: Order;
  variant?: "button" | "link";
  className?: string;
};

export function OrderDeliveryLabelButton({
  order,
  variant = "button",
  className,
}: OrderDeliveryLabelButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      downloadOrderDeliveryLabelPdf(order);
    } catch {
      setError("Could not generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (variant === "link") {
    return (
      <span className={cn("inline-flex flex-col items-start gap-0.5", className)}>
        <button
          type="button"
          onClick={() => {
            void handleDownload();
          }}
          disabled={isGenerating}
          className="inline-flex items-center gap-1 font-medium text-accent hover:underline disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {isGenerating ? "PDF…" : "Label"}
        </button>
        {error ? <span className="text-[10px] text-danger">{error}</span> : null}
      </span>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isGenerating}
        onClick={() => {
          void handleDownload();
        }}
      >
        <Download className="h-4 w-4" aria-hidden />
        {isGenerating ? "Generating…" : "Download delivery label"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

import { cn } from "@/lib/utils/cn";
import {
  CUSTOMER_STATUS_DESCRIPTIONS,
  CUSTOMER_STATUS_LABELS,
} from "@/lib/utils/order-status";
import type { OrderStatus } from "@/types/order";

const FLOW_STATUSES: OrderStatus[] = ["pending", "transferred", "delivered"];

type OrderStatusTimelineProps = {
  status: OrderStatus;
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-danger/30 bg-background p-4">
        <p className="font-medium text-danger">{CUSTOMER_STATUS_LABELS.cancelled}</p>
        <p className="mt-1 text-sm text-muted">{CUSTOMER_STATUS_DESCRIPTIONS.cancelled}</p>
      </div>
    );
  }

  const activeIndex = FLOW_STATUSES.indexOf(status);

  return (
    <ol className="space-y-4">
      {FLOW_STATUSES.map((stepStatus, index) => {
        const isComplete = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li key={stepStatus} className="flex gap-4">
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                isComplete
                  ? "border-accent bg-accent text-white"
                  : "border-muted/40 bg-surface text-muted",
              )}
            >
              {index + 1}
            </div>
            <div>
              <p
                className={cn(
                  "font-medium",
                  isCurrent ? "text-accent" : isComplete ? "text-foreground" : "text-muted",
                )}
              >
                {CUSTOMER_STATUS_LABELS[stepStatus]}
                {isCurrent ? " (current)" : null}
              </p>
              <p className="mt-1 text-sm text-muted">
                {CUSTOMER_STATUS_DESCRIPTIONS[stepStatus]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

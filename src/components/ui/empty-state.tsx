import { cn } from "@/lib/utils/cn";

import { Text } from "./text";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted/30 bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <Text variant="h2" as="h2">
        {title}
      </Text>
      {description ? (
        <Text variant="muted" as="p" className="max-w-sm">
          {description}
        </Text>
      ) : null}
      {action}
    </div>
  );
}

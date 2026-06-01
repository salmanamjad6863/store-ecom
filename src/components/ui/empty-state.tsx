import { cn } from "@/lib/utils/cn";

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
        "flex flex-col items-center justify-center gap-4 border border-dashed border-deep/15 bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <h2 className="font-serif text-xl font-semibold text-deep sm:text-2xl">{title}</h2>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-warm">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

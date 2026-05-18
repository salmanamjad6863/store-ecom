import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "bg-background text-foreground border border-muted/30",
  sale: "border border-accent text-accent bg-surface",
  soldOut: "border border-danger/40 bg-danger/10 font-semibold text-danger",
} as const;

type BadgeVariant = keyof typeof variantStyles;

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

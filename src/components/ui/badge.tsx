import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "bg-background text-foreground border border-muted/30",
  sale: "border border-accent bg-accent text-white",
  soldOut: "border border-danger/40 bg-danger/10 font-semibold text-danger",
  new: "bg-accent text-white border border-accent",
  lowStock: "bg-gold/90 text-deep border border-gold",
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
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider sm:rounded-sm sm:px-2.5 sm:text-[10px]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

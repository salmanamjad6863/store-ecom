import { cn } from "@/lib/utils/cn";

const variantStyles = {
  h1: "text-3xl font-semibold tracking-tight text-foreground",
  h2: "text-2xl font-semibold tracking-tight text-foreground",
  body: "text-base text-foreground",
  muted: "text-base text-muted",
  small: "text-sm text-muted",
} as const;

type TextVariant = keyof typeof variantStyles;

type TextProps = {
  variant?: TextVariant;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "div";
  className?: string;
  children: React.ReactNode;
};

export function Text({
  variant = "body",
  as: Component = "p",
  className,
  children,
}: TextProps) {
  return <Component className={cn(variantStyles[variant], className)}>{children}</Component>;
}

import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const variantStyles = {
  primary:
    "bg-accent text-white hover:bg-warm uppercase tracking-widest font-medium",
  secondary:
    "border border-muted/40 bg-surface text-foreground hover:bg-soft uppercase tracking-wider",
  ghost: "text-foreground hover:bg-soft",
  outlineLight:
    "border border-cream/30 bg-transparent text-cream hover:border-blush hover:text-blush uppercase tracking-widest",
} as const;

const sizeStyles = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-xs sm:text-sm",
  lg: "h-12 px-6 text-sm",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
} & (
  | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "className">)
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
);

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-none font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type="button" className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

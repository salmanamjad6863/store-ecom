import { cn } from "@/lib/utils/cn";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-muted/20 bg-surface p-6 shadow-sm", className)}>
      {children}
    </div>
  );
}

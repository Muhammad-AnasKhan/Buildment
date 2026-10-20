"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PendingSubmitButton({
  children,
  pendingLabel,
  className,
  size,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
}) {
  return (
    <Button type="submit" size={size} variant={variant} className={cn(className)} loadingLabel={pendingLabel}>
      {children}
    </Button>
  );
}

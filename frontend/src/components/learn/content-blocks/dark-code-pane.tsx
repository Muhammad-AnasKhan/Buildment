import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared code surface for MDX / API / exercise panes — follows --code-* theme tokens. */
export function DarkCodePane({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto bg-[var(--code-surface)] font-mono text-[12px] leading-[1.65] text-[var(--code-fg)] sm:text-[13px]",
        className
      )}
    >
      {children}
    </div>
  );
}

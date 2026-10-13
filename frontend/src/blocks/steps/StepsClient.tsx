"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StepsClient({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-xl border border-border/90 bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)]"
      )}
    >
      {title ? (
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </h2>
        </div>
      ) : null}

      <div className="px-6 py-6">{children}</div>
    </div>
  );
}

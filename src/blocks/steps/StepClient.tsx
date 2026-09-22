"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StepClient({
  stepNumber,
  title,
  children,
  isLast,
}: {
  stepNumber: number;
  title: string;
  children: ReactNode;
  isLast: boolean;
}) {
  return (
    <div className={cn("relative flex gap-4", !isLast && "pb-8")}>
      {/* Connecting vertical line from this step's circle to the next */}
      {!isLast && (
        <div
          className="absolute left-[15px] top-8 w-px bg-border"
          style={{ height: "calc(100% - 16px)" }}
          aria-hidden="true"
        />
      )}

      {/* Numbered circle */}
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10 text-sm font-bold text-primary">
        {stepNumber}
      </div>

      {/* Step body */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <div
          className={cn(
            "mt-2 text-[15px] leading-relaxed text-foreground/90",
            "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
            "[&_.shiki-figure]:my-4",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
            "[&_strong]:font-semibold [&_strong]:text-foreground",
            "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5",
            "[&_:not(pre)>code]:text-[13px] [&_:not(pre)>code]:text-foreground",
            "[&_:not(pre)>code:before]:content-none [&_:not(pre)>code:after]:content-none"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

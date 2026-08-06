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
          className="absolute left-[15px] top-8 w-px bg-neutral-200"
          style={{ height: "calc(100% - 16px)" }}
          aria-hidden="true"
        />
      )}

      {/* Numbered circle */}
      <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-50 text-sm font-bold text-indigo-700">
        {stepNumber}
      </div>

      {/* Step body */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className="text-[15px] font-semibold leading-snug text-neutral-950">
          {title}
        </h3>
        <div className="mt-2 text-[15px] leading-relaxed text-neutral-700 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_pre]:my-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:bg-neutral-950 [&_pre]:p-4 [&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-neutral-800 [&_code:before]:content-none [&_code:after]:content-none [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-neutral-950 [&_li]:my-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

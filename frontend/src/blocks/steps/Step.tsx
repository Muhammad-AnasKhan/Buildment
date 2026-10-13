import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StepProps = {
  title?: string;
  stepNumber?: number | string;
  description?: string;
  content?: string;
  children?: ReactNode;
};

export function Step({ title, stepNumber, description, content, children }: StepProps) {
  return (
    <li className="group relative flex gap-4 pb-6 last:pb-0 list-none">
      <div className="flex flex-col items-center">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
          {stepNumber ?? "•"}
        </span>
        <div className="mt-2 h-full w-px bg-border group-last:hidden" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {title ? (
          <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        ) : null}
        <div className="mt-1 text-sm leading-relaxed text-muted-foreground [&_p]:mt-0 [&_p+p]:mt-2">
          {children ?? content ?? description}
        </div>
      </div>
    </li>
  );
}

Step.displayName = "Step";

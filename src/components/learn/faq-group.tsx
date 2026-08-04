"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function FaqGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="divide-y divide-neutral-200">{children}</div>
    </div>
  );
}

function FaqItemInner({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "transition-colors",
          open && "bg-neutral-50/80"
        )}
      >
        <CollapsibleTrigger className="group flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-4">
          <span
            className={cn(
              "min-w-0 flex-1 text-[15px] font-medium leading-snug transition-colors",
              open ? "text-neutral-950" : "text-neutral-800 group-hover:text-neutral-950"
            )}
          >
            {question}
          </span>
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors",
              open
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                : "border-neutral-200 bg-white text-neutral-400 group-hover:border-neutral-300 group-hover:text-neutral-600"
            )}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-neutral-200/80 px-5 pb-5 pt-4 sm:px-6">
            <div className="border-l-2 border-indigo-200 pl-4 text-[15px] leading-relaxed text-neutral-600 [&>p]:m-0">
              {children}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return <FaqItemInner question={question}>{children}</FaqItemInner>;
}

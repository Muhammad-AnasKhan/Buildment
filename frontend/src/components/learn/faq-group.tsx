"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function FaqGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      {title ? (
        <div className="border-b border-border bg-muted/40 px-5 py-3 font-semibold text-foreground">
          {title}
        </div>
      ) : null}
      <div className="divide-y divide-border">{children}</div>
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
          open && "bg-muted/40"
        )}
      >
        <CollapsibleTrigger className="group flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-4">
          <span
            className={cn(
              "min-w-0 flex-1 text-[15px] font-medium leading-snug transition-colors",
              open ? "text-foreground" : "text-foreground/90 group-hover:text-foreground"
            )}
          >
            {question}
          </span>
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors",
              open
                ? "border-border bg-muted text-foreground"
                : "border-border bg-card text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground"
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
          <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6">
            <div className="text-[15px] leading-relaxed text-foreground/85 [&>p]:m-0">
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
  answer,
  children,
}: {
  question: string;
  answer?: string;
  children?: React.ReactNode;
}) {
  return <FaqItemInner question={question}>{children ?? answer}</FaqItemInner>;
}

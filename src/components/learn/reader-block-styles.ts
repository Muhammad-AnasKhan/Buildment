import { cn } from "@/lib/utils";

/** Shared chrome for interactive reader blocks (quiz, open question, checklist, learning log). */
export const readerBlockOuter = cn(
  "not-prose overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
);

export const readerBlockInner = cn("px-5 py-5 sm:px-6 sm:py-6");

export const readerBlockEyebrow = cn(
  "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
);

export function readerBlockGrouped(position: "single" | "first" | "middle" | "last") {
  return cn(
    "not-prose bg-card text-card-foreground",
    position === "single" && "my-8 overflow-hidden rounded-xl border border-border shadow-sm",
    position === "first" && "mt-8 overflow-hidden rounded-t-xl border border-b-0 border-border",
    position === "middle" && "-mt-px border-x border-border bg-card",
    position === "last" &&
      "-mt-px mb-8 overflow-hidden rounded-b-xl border border-t-0 border-border shadow-sm"
  );
}

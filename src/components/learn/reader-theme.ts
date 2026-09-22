import { cn } from "@/lib/utils";

/** Shared surfaces for chapter reader + MDX blocks — always use theme tokens. */
export const readerCard = cn(
  "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
);

export const readerCardLg = cn(
  "overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm"
);

export const readerCardHeader = cn("border-b border-border bg-muted/50 px-5 py-4 sm:px-6");

export const readerCardFooter = cn("border-t border-border bg-muted/30 px-5 py-4 sm:px-6");

export const readerBodyText = "text-[15px] leading-relaxed text-foreground/90";

export const readerTitle = "text-[15px] font-medium leading-snug text-foreground sm:text-base";

export const readerEyebrow = "text-[11px] font-semibold uppercase tracking-widest text-muted-foreground";

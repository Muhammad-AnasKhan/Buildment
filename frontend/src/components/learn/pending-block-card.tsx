import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { readerCard, readerCardHeader, readerEyebrow } from "@/components/learn/reader-theme";

export type PendingBlockCardProps = {
  typeLabel: string;
  title?: string;
  description?: string;
  blockId?: string;
  className?: string;
};

export function PendingBlockCard({
  typeLabel,
  title,
  description,
  blockId,
  className,
}: PendingBlockCardProps) {
  return (
    <div
      className={cn(
        "not-prose my-6 rounded-xl border border-dashed border-border/80 bg-muted/20 text-card-foreground shadow-sm transition-all",
        className
      )}
      data-pending-block={typeLabel}
    >
      <div className="flex items-center justify-between border-b border-dashed border-border/60 bg-muted/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary/70 animate-pulse" aria-hidden />
          <span className={cn(readerEyebrow, "text-foreground/70")}>{typeLabel}</span>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Pending setup
        </span>
      </div>
      <div className="px-5 py-5 sm:px-6">
        <h4 className="text-base font-semibold text-foreground">
          {title || `${typeLabel} in progress`}
        </h4>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description ||
            "This interactive checkpoint is being finalized by the course mentor. You can continue reading or check back shortly."}
        </p>
        {blockId ? (
          <div className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/60">
            <span>Reference:</span>
            <span className="truncate max-w-[200px]">{blockId}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

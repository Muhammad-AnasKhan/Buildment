import { BookOpen, Check, Clock3, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";
import { readerCardLg, readerEyebrow } from "../../components/learn/reader-theme";

export function MustReadCard({
  title,
  href,
  source,
  summary,
  readMinutes,
  read = false,
  required = true,
  blockId,
  disabled = false,
  error,
  onReadChange,
}: {
  title: string;
  href: string;
  source?: string;
  summary: string;
  read?: boolean;
  required?: boolean;
  blockId?: string;
  readMinutes?: number;
  disabled?: boolean;
  error?: string;
  onReadChange?: (read: boolean) => void;
}) {
  return (
    <section id={blockId && required ? `checkpoint-${blockId}` : undefined} data-checkpoint={blockId && required ? (read ? "done" : "open") : undefined} className={cn("not-prose my-8 scroll-mt-24", readerCardLg)} data-must-read>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/25 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground"><BookOpen className="size-4" aria-hidden /></span>
          <p className={readerEyebrow}>{required ? "Required reading" : "Optional reading"}</p>
        </div>
        {readMinutes ? <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden /> About {readMinutes} min</span> : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {source ? <p className={`${readerEyebrow} mb-2 normal-case tracking-normal`}>{source}</p> : null}
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground">{summary}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85">
          Open reading <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
      <div className={cn("flex items-start gap-3 border-t border-border px-5 py-4 sm:px-6", read ? "bg-emerald-500/[0.07]" : "bg-muted/20")}>
        <button type="button" disabled={read || disabled} aria-pressed={read} onClick={() => onReadChange?.(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
          {read ? <Check className="size-4" aria-hidden /> : null}
          {read ? "Marked as read" : disabled ? "Saving…" : "Mark as read after opening"}
        </button>
        {error ? <p role="alert" className="pt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </section>
  );
}

"use client";

import { useId, useState } from "react";
import { BookOpen, Check, Clock3, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { readerCardLg, readerEyebrow } from "@/components/learn/reader-theme";
import { checkpointAttrs } from "@/components/learn/checkpoint-marker";
import { playFeedback } from "@/lib/sound-feedback";
import { apiFetch } from "@/lib/api-client";

type MandatoryReadCardProps = {
  title: string;
  href: string;
  source?: string;
  summary: string;
  readMinutes?: number;
  blockId?: string;
  initialRead?: boolean;
};

export function MandatoryReadCard({
  title,
  href,
  source,
  summary,
  readMinutes,
  blockId,
  initialRead = false,
}: MandatoryReadCardProps) {
  const checkboxId = useId();
  const [read, setRead] = useState(initialRead);

  function toggle(checked: boolean) {
    if (checked) playFeedback("check");
    setRead(checked);
    if (blockId) {
      // Fire-and-forget: the checkbox is optimistic, the server state catches up on refresh.
      void apiFetch(`/api/v1/blocks/${blockId}/respond`, { method: "POST", json: { complete: checked } }).catch(() => undefined);
    }
  }

  return (
    <div
      {...(blockId ? checkpointAttrs(blockId, read) : {})}
      className={cn("not-prose my-8 scroll-mt-24", readerCardLg)}
      data-must-read
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/25 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground"><BookOpen className="size-4" aria-hidden /></span>
          <p className={readerEyebrow}>Required reading</p>
        </div>
        {readMinutes ? <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden /> About {readMinutes} min</span> : null}
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {source ? <p className={`${readerEyebrow} mb-2 normal-case tracking-normal`}>{source}</p> : null}
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-85">
          Open reading <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      <div className={cn("flex items-start gap-3 border-t border-border px-5 py-4 sm:px-6", read ? "bg-emerald-500/[0.07]" : "bg-muted/20")}>
        <Checkbox id={checkboxId} checked={read} onCheckedChange={(value) => toggle(value === true)} />
        <div className="min-w-0">
          <Label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-1.5 text-sm font-medium leading-none text-foreground">
            {read ? "Marked as read" : "Mark as read after opening"}
            {read ? <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden /> : null}
          </Label>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{read ? "You can revisit this resource anytime." : blockId ? "Your progress is saved when you check this box." : "Check this box when you finish the reading."}</p>
        </div>
      </div>
    </div>
  );
}

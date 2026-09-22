import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type RealWorldEventProps = {
  title: string;
  when: string;
  summary: string;
  lesson: string;
};

export function RealWorldEvent({ title, when, summary, lesson }: RealWorldEventProps) {
  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-xl border border-sky-500/30",
        "bg-gradient-to-br from-sky-500/10 via-card to-card text-card-foreground"
      )}
    >
      <div className="flex items-center gap-2 border-b border-sky-500/20 bg-sky-500/5 px-5 py-2.5 sm:px-6">
        <Globe className="size-4 text-sky-600 dark:text-sky-300" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-800 dark:text-sky-200">
          Real-world event
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">{title}</h3>
          <span className="text-xs font-medium text-sky-700 dark:text-sky-300">{when}</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
        <p className="mt-4 rounded-lg border border-sky-500/25 bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-foreground">Takeaway for your build: </span>
          {lesson}
        </p>
      </div>
    </div>
  );
}

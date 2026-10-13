import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { readerCard, readerCardHeader, readerEyebrow } from "@/components/learn/reader-theme";

type RealWorldEventProps = {
  title: string;
  when: string;
  summary: string;
  lesson: string;
};

export function RealWorldEvent({ title, when, summary, lesson }: RealWorldEventProps) {
  return (
    <div
      className={cn("not-prose my-8", readerCard)}
    >
      <div className={cn(readerCardHeader, "flex items-center gap-2 py-3")}>
        <Globe className="size-4 text-muted-foreground" aria-hidden />
        <p className={readerEyebrow}>
          Real-world event
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">{title}</h3>
          <span className="text-xs font-medium text-muted-foreground">{when}</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>
        <p className="mt-4 rounded-lg border border-border bg-muted/45 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <span className="font-semibold text-foreground">Takeaway for your build: </span>
          {lesson}
        </p>
      </div>
    </div>
  );
}

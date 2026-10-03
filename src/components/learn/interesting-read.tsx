import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { renderProseMarkdown } from "@/lib/parse-prose-markdown";
import { cn } from "@/lib/utils";
import { readerCard, readerCardHeader, readerEyebrow } from "@/components/learn/reader-theme";

type InterestingReadProps = {
  title: string;
  hook: string;
  readMinutes?: number;
  children?: ReactNode;
};

export function InterestingRead({ title, hook, readMinutes, children }: InterestingReadProps) {
  return (
    <div className={cn("not-prose my-8", readerCard)}>
      <div className={cn(readerCardHeader, "flex items-center justify-between gap-3 py-3")}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" aria-hidden />
          <p className={readerEyebrow}>
            Something interesting to read
          </p>
        </div>
        {readMinutes ? (
          <span className="text-xs text-muted-foreground">~{readMinutes} min</span>
        ) : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">{title}</h3>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-foreground/90">{hook}</p>
        {children ? (
          <div className="prose prose-neutral mt-4 max-w-none text-[15px] leading-relaxed prose-p:my-2">
            {renderProseMarkdown(children)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

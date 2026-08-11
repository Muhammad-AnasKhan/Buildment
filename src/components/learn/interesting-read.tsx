import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { renderProseMarkdown } from "@/lib/parse-prose-markdown";

type InterestingReadProps = {
  title: string;
  hook: string;
  readMinutes?: number;
  children?: ReactNode;
};

export function InterestingRead({ title, hook, readMinutes, children }: InterestingReadProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-white">
      <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/50 px-5 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-600" aria-hidden />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-800">
            Something interesting to read
          </p>
        </div>
        {readMinutes ? (
          <span className="text-xs text-amber-700/80">~{readMinutes} min</span>
        ) : null}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <h3 className="text-[15px] font-semibold leading-snug text-neutral-950 sm:text-base">{title}</h3>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-amber-950/90">{hook}</p>
        {children ? (
          <div className="prose prose-neutral mt-4 max-w-none text-[15px] leading-relaxed text-neutral-700 prose-p:my-2">
            {renderProseMarkdown(children)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

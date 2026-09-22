import type { ReactNode } from "react";
import { Newspaper } from "lucide-react";
import { renderProseMarkdown } from "@/lib/parse-prose-markdown";

type ArticleBreakProps = {
  title: string;
  subtitle?: string;
  readMinutes?: number;
  children?: ReactNode;
};

/** Longer in-course article between major modules — mandatory-style reading break. */
export function ArticleBreak({ title, subtitle, readMinutes, children }: ArticleBreakProps) {
  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-neutral-200 bg-neutral-950 px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
            <Newspaper className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Article break — read before you continue
            </p>
            <h3 className="mt-1 text-lg font-semibold leading-snug text-white sm:text-xl">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-neutral-300">{subtitle}</p> : null}
            {readMinutes ? (
              <p className="mt-2 text-xs text-neutral-400">~{readMinutes} min read</p>
            ) : null}
          </div>
        </div>
      </div>
      {children ? (
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-p:my-3">
            {renderProseMarkdown(children)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

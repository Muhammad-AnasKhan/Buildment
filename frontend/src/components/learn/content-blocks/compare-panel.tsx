import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";

type CompareColumnProps = {
  label: string;
  content?: string;
  children?: ReactNode;
};

export function CompareColumn({ label, content, children }: CompareColumnProps) {
  return (
    <div className="min-w-0 flex-1 px-5 py-5 sm:px-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="text-sm leading-relaxed text-foreground/85 [&_p]:mt-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:my-2 [&_li]:my-0.5">
        {children ?? content}
      </div>
    </div>
  );
}

type ComparePanelProps = {
  title?: string;
  leftLabel?: string;
  leftContent?: string;
  rightLabel?: string;
  rightContent?: string;
  children?: ReactNode;
};

export function ComparePanel({
  title,
  leftLabel,
  leftContent,
  rightLabel,
  rightContent,
  children,
}: ComparePanelProps) {
  const hasDirectColumns = Boolean(leftLabel || rightLabel);

  return (
    <LearnPanelShell eyebrow="Compare" title={title} contentClassName="border-0 bg-transparent shadow-none">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm lg:grid-cols-2 lg:divide-x lg:divide-border">
        {children}
        {hasDirectColumns && !children ? (
          <>
            {leftLabel ? <CompareColumn label={leftLabel} content={leftContent} /> : null}
            {rightLabel ? <CompareColumn label={rightLabel} content={rightContent} /> : null}
          </>
        ) : null}
      </div>
    </LearnPanelShell>
  );
}

CompareColumn.displayName = "CompareColumn";

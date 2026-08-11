import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LearnPanelShell } from "./learn-panel-shell";

type CompareColumnProps = {
  label: string;
  children?: ReactNode;
};

export function CompareColumn({ label, children }: CompareColumnProps) {
  return (
    <div className="min-w-0 flex-1 px-5 py-5 sm:px-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</p>
      <div className="text-sm leading-relaxed text-neutral-700 [&_p]:mt-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-neutral-900 [&_ul]:my-2 [&_li]:my-0.5">
        {children}
      </div>
    </div>
  );
}

type ComparePanelProps = {
  title?: string;
  children?: ReactNode;
};

export function ComparePanel({ title, children }: ComparePanelProps) {
  return (
    <LearnPanelShell eyebrow="Compare" title={title} contentClassName="border-0 bg-transparent shadow-none">
      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:grid-cols-2 lg:divide-x lg:divide-neutral-200">
        {children}
      </div>
    </LearnPanelShell>
  );
}

CompareColumn.displayName = "CompareColumn";

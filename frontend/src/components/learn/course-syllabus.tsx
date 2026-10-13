"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SyllabusChapterRow } from "./syllabus-chapter-row";

import type { SyllabusChapter, SyllabusModule } from "@buildment/shared/api/syllabus";

export type { SyllabusChapter, SyllabusModule };

type CourseSyllabusProps = {
  courseSlug: string;
  modules: SyllabusModule[];
  defaultOpenModuleId: string | null;
  percentComplete?: number;
  chaptersCompleted?: number;
  chaptersTotal?: number;
};

function ModuleCard({
  courseSlug,
  module,
  defaultOpen,
}: {
  courseSlug: string;
  module: SyllabusModule;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = module.chapters.length;
  const done = module.completedCount;
  const moduleComplete = total > 0 && done === total;
  const moduleInProgress = !moduleComplete && done > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <article
        className={cn(
          "overflow-hidden rounded-xl border border-border",
          moduleComplete
            ? "border-emerald-500/20 bg-emerald-500/[0.12] dark:border-emerald-400/25 dark:bg-emerald-500/15"
            : "bg-muted/20 dark:bg-muted/30"
        )}
      >
        <CollapsibleTrigger
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
          aria-label={`${module.title}: ${done} of ${total} lessons complete${moduleComplete ? ", module complete" : ""}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold tabular-nums",
                moduleComplete
                  ? "border-border bg-muted/50 text-muted-foreground"
                  : moduleInProgress
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground"
              )}
            >
              {String(module.order).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
                {module.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {done}/{total} lessons complete
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {moduleComplete ? (
              <CheckCircle2
                className="size-4 text-emerald-600/80 dark:text-emerald-400/80"
                aria-hidden
              />
            ) : null}
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <ul className="divide-y divide-border border-t border-border">
            {module.chapters.map((chapter) => (
              <li key={chapter.id}>
                <SyllabusChapterRow
                  courseSlug={courseSlug}
                  chapter={chapter}
                  variant="syllabus"
                />
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </article>
    </Collapsible>
  );
}

export function CourseSyllabus({
  courseSlug,
  modules,
  defaultOpenModuleId,
  percentComplete,
  chaptersCompleted,
  chaptersTotal,
}: CourseSyllabusProps) {
  const totalLessons = chaptersTotal ?? modules.reduce((sum, mod) => sum + mod.chapters.length, 0);
  const completed =
    chaptersCompleted ?? modules.reduce((sum, mod) => sum + mod.completedCount, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Course content</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {completed}/{totalLessons} lessons complete
            {percentComplete != null ? ` · ${percentComplete}% overall` : ""}
          </p>
        </div>
        {percentComplete != null ? (
          <div className="min-w-[8rem] flex-1 sm:max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary dark:bg-emerald-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            courseSlug={courseSlug}
            module={mod}
            defaultOpen={mod.id === defaultOpenModuleId}
          />
        ))}
      </div>
    </section>
  );
}

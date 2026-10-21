"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { MARKETPLACE_WEEKS } from "@/lib/marketplace-weeks";
import { useState } from "react";
import { SyllabusChapterRow } from "./syllabus-chapter-row";

import type { SyllabusChapter, SyllabusModule } from "@/shared/api/syllabus";

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
  textControls = false,
}: {
  courseSlug: string;
  module: SyllabusModule;
  defaultOpen: boolean;
  textControls?: boolean;
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
          "overflow-hidden rounded-xl border border-border shadow-sm",
          moduleComplete
            ? "border-emerald-500/20 bg-emerald-500/[0.12] dark:border-emerald-400/25 dark:bg-emerald-500/15"
            : textControls ? "bg-background" : "bg-muted/20 dark:bg-muted/30"
        )}
      >
        <CollapsibleTrigger
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          aria-label={`${module.title}: ${done} of ${total} lessons complete${moduleComplete ? ", module complete" : ""}`}
        >
          <div className={cn("flex min-w-0", textControls ? "flex-1" : "items-center gap-3")}>
            {!textControls ? <span
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
            </span> : null}
            <div className="min-w-0">
              <h3 className={cn("text-sm font-semibold tracking-tight text-foreground", !textControls && "truncate")}>
                {textControls ? `Module ${String(module.order).padStart(2, "0")}: ` : ""}{module.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {done}/{total} lessons complete
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!textControls && moduleComplete ? (
              <CheckCircle2
                className="size-4 text-emerald-600/80 dark:text-emerald-400/80"
                aria-hidden
              />
            ) : null}
            {textControls ? <span className="rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground">{open ? "Hide lessons" : "View lessons"}</span> : <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />}
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

function SyllabusSection({
  courseSlug,
  title,
  sectionId,
  modules,
  defaultOpenModuleId,
  open,
  onOpenChange,
}: {
  courseSlug: string;
  title: string;
  sectionId: string;
  modules: SyllabusModule[];
  defaultOpenModuleId: string | null;
  open: boolean;
  onOpenChange: (sectionId: string) => void;
}) {
  const lessonCount = modules.reduce((total, module) => total + module.chapters.length, 0);
  return (
    <Collapsible open={open} onOpenChange={() => onOpenChange(sectionId)}>
      <article className="overflow-hidden bg-background transition-colors">
        <CollapsibleTrigger className="flex min-h-[68px] w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5">
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} aria-hidden />
          <h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-foreground sm:text-base">{title}</h3>
          <span className="shrink-0 text-right text-xs text-muted-foreground sm:text-sm">{modules.length} modules · {lessonCount} lessons</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 border-t bg-muted/20 p-3 sm:p-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} courseSlug={courseSlug} module={module} defaultOpen={module.id === defaultOpenModuleId} textControls />
          ))}
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
  const marketplaceModules = courseSlug === "multi-vendor-marketplace";
  const marketplaceWeeks = MARKETPLACE_WEEKS.map((week) => ({
    id: `week-${week.number}`,
    title: `Week ${week.number} - ${week.title}`,
    modules: modules.filter((module) => module.order >= week.from && module.order <= week.to && module.chapters.length > 0),
  })).filter((section) => section.modules.length > 0);
  const closingModules = modules.filter((module) => module.order === 99 && module.chapters.length > 0);
  const additionalModules = modules.filter((module) => module.order !== 99 && !MARKETPLACE_WEEKS.some((week) => module.order >= week.from && module.order <= week.to) && module.chapters.length > 0);
  const marketplaceSections = [
    ...marketplaceWeeks,
    ...closingModules.map((module) => ({ id: `closing-${module.id}`, title: `Finish and present: ${module.title}`, modules: [module] })),
    ...(additionalModules.length ? [{ id: "additional-modules", title: "Additional modules", modules: additionalModules }] : []),
  ];
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const activeModule = modules.find((module) => module.id === defaultOpenModuleId);
    if (!activeModule) return [];
    const week = MARKETPLACE_WEEKS.find((item) => activeModule.order >= item.from && activeModule.order <= item.to);
    if (week) return [`week-${week.number}`];
    if (activeModule.order >= 21 && activeModule.order <= 25) return ["week-4"];
    return activeModule.order === 99 ? [`closing-${activeModule.id}`] : ["additional-modules"];
  });
  const totalLessons = chaptersTotal ?? modules.reduce((sum, mod) => sum + mod.chapters.length, 0);
  const completed =
    chaptersCompleted ?? modules.reduce((sum, mod) => sum + mod.completedCount, 0);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Course content</h2>
          {marketplaceModules ? (
            <p className="mt-1 text-sm text-muted-foreground">{marketplaceSections.length} sections · {totalLessons} lessons · {completed}/{totalLessons} complete{percentComplete != null ? ` · ${percentComplete}% overall` : ""}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {completed}/{totalLessons} lessons complete
              {percentComplete != null ? ` · ${percentComplete}% overall` : ""}
            </p>
          )}
        </div>
        {marketplaceModules ? (
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setExpandedSections((current) => current.length === marketplaceSections.length ? [] : marketplaceSections.map((section) => section.id))}
          >
            {expandedSections.length === marketplaceSections.length ? "Collapse all sections" : "Expand all sections"}
          </button>
        ) : percentComplete != null ? (
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

      {marketplaceModules ? (
        <div className="overflow-hidden rounded-lg border border-border divide-y divide-border">
          {marketplaceSections.map((section) => (
            <SyllabusSection
              key={section.id}
              courseSlug={courseSlug}
              sectionId={section.id}
              title={section.title}
              modules={section.modules}
              defaultOpenModuleId={defaultOpenModuleId}
              open={expandedSections.includes(section.id)}
              onOpenChange={(sectionId) => setExpandedSections((current) => current.includes(sectionId) ? current.filter((id) => id !== sectionId) : [...current, sectionId])}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => <ModuleCard key={mod.id} courseSlug={courseSlug} module={mod} defaultOpen={mod.id === defaultOpenModuleId} />)}
        </div>
      )}
    </section>
  );
}
